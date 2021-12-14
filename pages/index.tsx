import { addDoc, collection, DocumentData, onSnapshot, query } from '@firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { Session } from 'next-auth/core/types'
import { getProviders, getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { newTweetModalState } from '../atoms/atom'
import Feed from '../components/Feed'
import { NewTweetModal } from '../components/NewTweetModal'
import Sidebar from '../components/Sidebar'
import Widgets from '../components/Widgets'
import { db } from "../firebase"

const addNewUser = async (session: Session) => {
  await addDoc(collection(db, 'users'), {
    userID: session.user.uid,
    username: session.user.name,
    userImg: session.user.image,
    tag: session.user.tag,
    timestamp: serverTimestamp()
  })
}


export default function Home({ trendingResults, followResults, providers }) {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkIfUserExists = async (session: Session) => {
      onSnapshot(
        query(collection(db, "users")),
        async (snapshot) => {
          if (snapshot.docs.length < 1) {
            await addNewUser(session)
            setLoading(false)
          } else {
            console.log('setting id')
            session.user.uid = snapshot.docs[0].id
            console.log('id set')
          }
        })
    }

    checkIfUserExists(session)
  }, [])

  return (
    <div className="px-12 min-h-screen min-w-screen">
      <Head>
        <title>Twitter 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />
        <Feed />
        <Widgets />

        {isOpen && <NewTweetModal />}
      </main>

    </div>
  )
}

export const getServerSideProps = async (context) => {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then((res) => res.json())

  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then((res) => res.json());

  const providers = await getProviders()
  const session = await getSession(context)
  console.log(session)

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/auth'
      }
    }
  }

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session
    }
  }
}
