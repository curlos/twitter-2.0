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

const addNewUser = async (session: Session) => {
  const qUser = query(collection(db, "users"), where('tag', '==', session.user.tag));
  const qUserSnap = await getDocs(qUser);

  const userTag = qUserSnap.docs.length === 0 ? session.user.tag : session.user.tag + cryptoRandomString({ length: 6 });

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

  return docRef;
};

export default NextAuth({
  // Configure one or more authentication providers
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
    async session({ session, token }) {
      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();
      session.user.profilePic = session.user.image;

      const q = query(collection(db, "users"), where('email', '==', session.user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length > 0) {
        // If user is signing in with an exisitng account
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
        // If user is signing up with a new account
        const docRef = await addNewUser(session);
        session.user.uid = docRef.id;

        const userDoc = await getDoc(docRef);

        const { bio, location, website, dateJoined } = userDoc.data();

        session.user.bio = bio;
        session.user.location = location;
        session.user.website = website;
        session.user.dateJoined = dateJoined;
      }

      console.log({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      });

      return session;
    },
  },
  secret: process.env.JWT_SECRET
});