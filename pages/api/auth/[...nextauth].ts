import NextAuth from "next-auth";
import { Session } from "next-auth/core/types";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import cryptoRandomString from 'crypto-random-string';

// Universal Firebase initialization that works in both local and serverless environments
const getFirebaseDb = () => {
  try {
    // Server-side: use dynamic import to avoid initialization issues
    if (typeof window === 'undefined') {
      const { initializeApp, getApp, getApps } = require("firebase/app");
      const { getFirestore } = require("firebase/firestore");

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      };

      // Check if Firebase is already initialized
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const db = getFirestore(app);
      return db;
    }
    return null;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return null;
  }
};

// Get Firebase functions dynamically to avoid module-level imports
const getFirebaseFunctions = () => {
  try {
    if (typeof window === 'undefined') {
      const { addDoc, collection, query, serverTimestamp, getDoc, where, getDocs, doc } = require("firebase/firestore");
      return { addDoc, collection, query, serverTimestamp, getDoc, where, getDocs, doc };
    }
    return null;
  } catch (error) {
    console.error('Firebase functions import failed:', error);
    return null;
  }
};

// Helper function to add timeout to Firebase operations for serverless compatibility
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase operation timeout')), timeoutMs)
    )
  ]);
};

/**
 * @description
 * @param {Session} session
 * @returns {DocumentReference<DocumentData>}
 */
const addNewUser = async (session: Session) => {
  const db = getFirebaseDb();
  const firebase = getFirebaseFunctions();

  if (!db || !firebase) {
    throw new Error('Firebase not initialized');
  }

  const { addDoc, collection, query, serverTimestamp, where, getDocs } = firebase;

  // Go into the database and attempt to find a user with the same username (or tag) as the one the current user is to trying to create an account with.
  const qUser = query(collection(db, "users"), where('tag', '==', session.user.tag));
  // Using that queried user, get their docs with timeout.
  const qUserSnap = await withTimeout(getDocs(qUser), 3000);

  // If the username that was entered does not exist, then use that username.
  // Else if the username is already taken, then a random crypto string will be added to the end with a length of 6.
  const userTag = (qUserSnap as any)?.docs?.length === 0 ? session.user.tag : session.user.tag + cryptoRandomString({ length: 6 });

  // Add this user to the "users" collection, thus creating a NEW user.
  const docRef = await addDoc(collection(db, 'users'), {
    email: session.user.email,
    name: session.user.name,
    profilePic: session.user.image,
    tag: userTag,
    bio: null,
    location: null,
    website: null,
    banner: null,
    hashedPassword: null, // OAuth users don't have passwords
    dateJoined: serverTimestamp()
  });

  // Return the docRef of the newly created user.
  return docRef;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log('LOGGING IN....')

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = getFirebaseDb();
          const firebase = getFirebaseFunctions();

          if (!db || !firebase) {
            console.error('Firebase not initialized in credentials provider');
            return null;
          }

          const { query, collection, where, getDocs } = firebase;

          // Look up user by email
          const q = query(collection(db, "users"), where('email', '==', credentials.email));
          const querySnapshot = await withTimeout(getDocs(q), 3000);

          if ((querySnapshot as any)?.docs?.length === 0) {
            return null; // User not found
          }

          const userDoc = (querySnapshot as any)?.docs?.[0];
          const userData = userDoc?.data();

          // Check if password matches
          if (!userData.hashedPassword) {
            return null; // User doesn't have a password (OAuth user)
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, userData.hashedPassword);

          if (!isPasswordValid) {
            return null; // Invalid password
          }

          // Return user object
          return {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            image: userData.profilePic,
            tag: userData.tag,
            bio: userData.bio,
            location: userData.location,
            website: userData.website,
            banner: userData.banner,
            dateJoined: userData.dateJoined
          };
        } catch (error) {
          console.error("Error during credential authentication:", error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    /**
     * @description - JWT callback runs before session callback and handles token updates
     */
    async jwt({ token, trigger }: any) {
      // When update() is called, refresh user data from database
      if (trigger === "update" && token.sub) {
        try {
          const db = getFirebaseDb();
          const firebase = getFirebaseFunctions();

          if (!db || !firebase) {
            console.error('Firebase not initialized in JWT callback');
            return token;
          }

          const { getDoc, doc } = firebase;

          const userDoc = await withTimeout(getDoc(doc(db, 'users', token.sub)), 3000);
          if ((userDoc as any)?.exists?.()) {
            const userData = (userDoc as any)?.data?.();

            // Update token with fresh database data
            token.email = userData.email;
            token.name = userData.name;
            token.picture = userData.profilePic;
          }
        } catch (error) {
          console.error('JWT callback - error fetching user:', error);
        }
      }

      return token;
    },

    /**
     * @description - This is callback function that'll be called after the AuthProvider is done dealing with the account given to it by the user (like a user signing up using their Google Account). Then we can get the base information about a user using the data from the AuthProvider. For example, a user signing in with a GMAIL account will have an email, a name, an image (for their icon), etc. so we'll get that information right at the start of the callback inside the "session.user" object.
     * @param {
     *  {Session}: session - The object with the information about the user
     * }
     * @returns
     */
    async session({ session, token }) {
      // Try to find user by UID first (more reliable), then fall back to email for initial login
      let userFound = false;

      // Use UID from token (token.sub) instead of session.user.uid
      if (token.sub) {
        // If we have a UID, use direct document lookup (handles email changes properly)
        try {
          const db = getFirebaseDb();
          const firebase = getFirebaseFunctions();

          if (!db || !firebase) {
            console.error('Firebase not initialized in session callback');
            return session;
          }

          const { getDoc, doc } = firebase;

          const userDoc = await withTimeout(getDoc(doc(db, 'users', token.sub)), 3000);
          if ((userDoc as any)?.exists?.()) {
            const userData = (userDoc as any)?.data?.();

            // Update session with fresh data from database (including any email changes)
            session.user.email = userData.email;
            session.user.name = userData.name;
            session.user.tag = userData.tag;
            session.user.uid = token.sub; // Use token.sub as UID
            session.user.bio = userData.bio;
            session.user.location = userData.location;
            session.user.website = userData.website;
            session.user.dateJoined = userData.dateJoined;
            session.user.profilePic = userData.profilePic;
            session.user.banner = userData.banner;
            session.user.image = userData.profilePic;

            userFound = true;
          }
        } catch (error) {
          console.error('Error fetching user by UID:', error);
        }
      }

      // Fall back to email lookup for initial sessions (when UID not yet set)
      if (!userFound) {
        const db = getFirebaseDb();
        const firebase = getFirebaseFunctions();

        if (!db || !firebase) {
          console.error('Firebase not initialized in session email fallback');
          return session;
        }

        const { query, collection, where, getDocs } = firebase;

        const q = query(collection(db, "users"), where('email', '==', session.user.email));
        const querySnapshot = await withTimeout(getDocs(q), 3000);

        if ((querySnapshot as any)?.docs?.length > 0) {
          // Get values from the database of this existing user and set it inside the session object
          const { name, tag, bio, location, website, dateJoined, profilePic, banner, email } = (querySnapshot as any)?.docs?.[0]?.data();

          session.user.email = email;
          session.user.name = name;
          session.user.tag = tag;
          session.user.uid = (querySnapshot as any)?.docs?.[0]?.id;
          session.user.bio = bio;
          session.user.location = location;
          session.user.website = website;
          session.user.dateJoined = dateJoined;
          session.user.profilePic = profilePic;
          session.user.banner = banner;
          session.user.image = profilePic;

          userFound = true;
        }
      }

      if (!userFound) {
        // This should only happen for new OAuth users (credential users must register first)
        // Generate tag and profile pic for OAuth users
        session.user.tag = session.user.name
          .split(" ")
          .join("")
          .toLocaleLowerCase();
        session.user.profilePic = session.user.image;

        const docRef = await withTimeout(addNewUser(session), 5000);
        session.user.uid = docRef.id;

        const firebase = getFirebaseFunctions();
        if (firebase) {
          const { getDoc } = firebase;
          const userDoc = await withTimeout(getDoc(docRef), 3000);
          const { bio, location, website, dateJoined, tag } = (userDoc as any)?.data?.() || {};

          session.user.tag = tag
          session.user.bio = bio;
          session.user.location = location;
          session.user.website = website;
          session.user.dateJoined = dateJoined;
        }
      }

      return session;
    },
  },
  secret: process.env.JWT_SECRET
};

export default NextAuth(authOptions);