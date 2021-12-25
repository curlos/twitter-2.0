import { addDoc, collection, onSnapshot, query, serverTimestamp, getDoc, where, getDocs } from "firebase/firestore";
import NextAuth from "next-auth";
import { Session } from "next-auth/core/types";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../firebase"

const addNewUser = async (session: Session) => {

  console.log('adding')
  const docRef = await addDoc(collection(db, 'users'), {
    email: session.user.email,
    username: session.user.name,
    userImg: session.user.image,
    tag: session.user.tag,
    timestamp: serverTimestamp()
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

      console.log(session)

      const q = query(collection(db, "users"), where('email', '==', session.user.email))
      const querySnapshot = await getDocs(q)


      console.log('querying, results: ')
      console.log(querySnapshot.docs[0].data())
      console.log(querySnapshot.docs[0].id)
      console.log('-----')

      if (querySnapshot.docs.length > 0) {
        // If user is signing in with an exisitng account
        session.user.uid = querySnapshot.docs[0].id
      } else {
        // If user is signing up with a new account
        const docRef = await addNewUser(session)
        console.log(docRef)
      }

      return session;
    },
  },
});