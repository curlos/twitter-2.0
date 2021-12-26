import { addDoc, collection, onSnapshot, query, serverTimestamp, getDoc, where, getDocs } from "firebase/firestore";
import NextAuth from "next-auth";
import { Session } from "next-auth/core/types";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../firebase"

const addNewUser = async (session: Session) => {

  console.log('adding')
  console.log(session)
  const docRef = await addDoc(collection(db, 'users'), {
    email: session.user.email,
    username: session.user.name,
    profilePic: session.user.image,
    tag: session.user.tag,
    bio: null,
    location: null,
    website: null,
    banner: null,
    dateJoined: serverTimestamp()
  })

  return docRef
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token }) {

      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();
      session.user.profilePic = session.user.image

      console.log(session)

      const q = query(collection(db, "users"), where('email', '==', session.user.email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.docs.length > 0) {
        // If user is signing in with an exisitng account
        const { bio, location, website, dateJoined } = querySnapshot.docs[0].data()

        session.user.uid = querySnapshot.docs[0].id
        session.user.bio = bio
        session.user.location = location
        session.user.website = website
        session.user.dateJoined = dateJoined
      } else {
        // If user is signing up with a new account
        const docRef = await addNewUser(session)
        session.user.uid = docRef.id

        const userDoc = await getDoc(docRef)

        const { bio, location, website, dateJoined } = userDoc.data()

        session.user.bio = bio
        session.user.location = location
        session.user.website = website
        session.user.dateJoined = dateJoined
      }

      return session;
    },
  },
});