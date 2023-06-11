import { addDoc, collection, onSnapshot, query, serverTimestamp, getDoc, where, getDocs } from "firebase/firestore";
import NextAuth from "next-auth";
import { Session } from "next-auth/core/types";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterPorivder from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
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
    dateJoined: serverTimestamp()
  });

  // Return the docRef of the newly created user.
  return docRef;
};

export default NextAuth({
  // Configure one or more authentication providers
  // TODO: Add CredentialsProvider (Need this to create a bunch of accounts without having to create a bunch of GMAIL accounts + pretty much every app lets you create an account without having to use a third-party source.)
  providers: [
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. "Sign in with...")
    //   name: "Credentials",
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials, req) {
    //     // Add logic here to look up the user from the credentials supplied

    //     const session = {
    //       user: {
    //         name: credentials.username,
    //         email: '',
    //         profilePic: '/assets/default_profile_pic.png',
    //         banner: null,
    //         tag: credentials.username
    //       }
    //     }

    //     if (session) {
    //       // Any object returned will be saved in `user` property of the JWT
    //       return session
    //     } else {
    //       // If you return null then an error will be displayed advising the user to check their details.
    //       return null

    //       // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter        
    //     }
    //   }
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET
    // })
    // ...add more providers here
  ],
  callbacks: {
    /**
     * @description - This is callback function that'll be called after the AuthProvider is done dealing with the account given to it by the user (like a user signing up using their Google Account). Then we can get the base information about a user using the data from the AuthProvider. For example, a user signing in with a GMAIL account will have an email, a name, an image (for their icon), etc. so we'll get that information right at the start of the callback inside the "session.user" object.
     * @param {
     *  {Session}: session - The object with the information about the user
     * } 
     * @returns 
     */
    async session({ session, token }) {
      // TODO: No spaces allowed in the username and usernames are all set to all lowercase. This rule could change if I feel like it but for now I'll leave rule like this. It's not really a requirment but a preference.
      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();
      session.user.profilePic = session.user.image;

      const q = query(collection(db, "users"), where('email', '==', session.user.email));
      const querySnapshot = await getDocs(q);

      // If user is signing in with an exisitng account, then set the keys in the object to the values that already exist in the database.
      if (querySnapshot.docs.length > 0) {
        // Get values from the database of this existing user and set it inside the session object
        const { name, tag, bio, location, website, dateJoined, profilePic, banner } = querySnapshot.docs[0].data();

        session.user.name = name;
        session.user.tag = tag;
        session.user.uid = querySnapshot.docs[0].id;
        session.user.bio = bio;
        session.user.location = location;
        session.user.website = website;
        session.user.dateJoined = dateJoined;
        session.user.profilePic = profilePic;
        session.user.banner = banner;

      } else {
        // Else if user is signing up with a new account then we add them and create a new user using the information they or the AuthProvider (like Google) provided to us.
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
});