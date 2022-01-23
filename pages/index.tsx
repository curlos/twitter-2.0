import { addDoc, collection, DocumentData, onSnapshot, query } from '@firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { Session } from 'next-auth/core/types'
import { getProviders, getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { FaBell, FaFeatherAlt, FaHome, FaSearch } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { useRecoilState } from 'recoil'
import { colorThemeState, newTweetModalState, settingsModalState } from '../atoms/atom'
import Feed from '../components/Feed'
import Footer from '../components/Footer'
import { NewTweetModal } from '../components/NewTweetModal'
import SettingsModal from '../components/SettingsModal'
import Sidebar from '../components/Sidebar'
import Widgets from '../components/Widgets'
import { db } from "../firebase"


export default function Home({ trendingResults, followResults, providers }) {
  const { data: session, status } = useSession()
  const [isNewTweetModalOpen, setIsNewTweetModalOpen] = useRecoilState(newTweetModalState)
  const [isSettingsModalOpen, setSettingsModalOpen] = useRecoilState(settingsModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>Twitter 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white px-0 lg:px-12 min-h-screen min-w-screen flex`}>
        <Sidebar />
        <Feed />
        <Widgets />

        {isNewTweetModalOpen && <NewTweetModal />}
        {/* {isSettingsModalOpen && <SettingsModal />} */}

        {isSettingsModalOpen && <SettingsModal />}

        <div className="sm:hidden text-black dark:text-white  bg-lightblue-400 flex justify-center items-center rounded-full p-4 fixed bottom-0 right-0 mr-4 mb-16" onClick={() => setIsNewTweetModalOpen(true)}>
          <FaFeatherAlt className="h-7 w-7 cursor-pointer" />
        </div>

        <Footer />
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
