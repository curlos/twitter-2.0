import { addDoc, collection, onSnapshot, query, serverTimestamp, getDoc, where, getDocs, doc } from "firebase/firestore";
import NextAuth from "next-auth";
import { Session } from "next-auth/core/types";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "../../../firebase";
import cryptoRandomString from 'crypto-random-string';

/**
 * @description
 * @param {Session} session 
 * @returns {DocumentReference<DocumentData>}
 */
const addNewUser = async (session: Session) => {
  // Go into the database and attempt to find a user with the same username (or tag) as the one the current user is to trying to create an account with.
  const qUser = query(collection(db, "users"), where('tag', '==', session.user.tag));
  // Using that queried user, get their docs.
  const qUserSnap = await getDocs(qUser);

  // If the username that was entered does not exist, then use that username.
  // Else if the username is already taken, then a random crypto string will be added to the end with a length of 6.
  const userTag = qUserSnap.docs.length === 0 ? session.user.tag : session.user.tag + cryptoRandomString({ length: 6 });

  // TODO: Won't have to worry about email for now since I only have Google Auth setup but in the future will have to refactor when other auth methods are added.
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
  // Configure one or more authentication providers
  // TODO: Add CredentialsProvider (Need this to create a bunch of accounts without having to create a bunch of GMAIL accounts + pretty much every app lets you create an account without having to use a third-party source.)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Look up user by email
          const q = query(collection(db, "users"), where('email', '==', credentials.email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.docs.length === 0) {
            return null; // User not found
          }

          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

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
          const userDoc = await getDoc(doc(db, 'users', token.sub));
          if (userDoc.exists()) {
            const userData = userDoc.data();

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
          const userDoc = await getDoc(doc(db, 'users', token.sub));
          if (userDoc.exists()) {
            const userData = userDoc.data();

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
        const q = query(collection(db, "users"), where('email', '==', session.user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length > 0) {
          // Get values from the database of this existing user and set it inside the session object
          const { name, tag, bio, location, website, dateJoined, profilePic, banner, email } = querySnapshot.docs[0].data();

          session.user.email = email;
          session.user.name = name;
          session.user.tag = tag;
          session.user.uid = querySnapshot.docs[0].id;
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

        const docRef = await addNewUser(session);
        session.user.uid = docRef.id;

        const userDoc = await getDoc(docRef);
        const { bio, location, website, dateJoined } = userDoc.data();

        session.user.bio = bio;
        session.user.location = location;
        session.user.website = website;
        session.user.dateJoined = dateJoined;
      }

      return session;
    },
  },
  secret: process.env.JWT_SECRET
};

export default NextAuth(authOptions);