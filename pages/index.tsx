import { getProviders, getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { useRecoilState } from 'recoil'
import { newTweetModalState } from '../atoms/atom'
import Feed from '../components/Feed'
import { NewTweetModal } from '../components/NewTweetModal'
import Sidebar from '../components/Sidebar'
import Widgets from '../components/Widgets'

export default function Home({ trendingResults, followResults, providers }) {

  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)

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

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/auth'
      }
    }
  }

  console.log(session)

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session
    }
  }
}
