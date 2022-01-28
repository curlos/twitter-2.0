import { ArrowLeftIcon, BadgeCheckIcon } from '@heroicons/react/solid'
import { collection, doc, DocumentData, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { colorThemeState, newTweetModalState, searchModalState } from '../atoms/atom'
import Footer from '../components/Footer'
import { NewTweetModal } from '../components/NewTweetModal'
import { SearchModal } from '../components/SearchModal'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import TweetWithID from '../components/TweetWithID'
import Widgets from '../components/Widgets'
import { db } from '../firebase'

const Followers = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [isSearchModalOpen, setIsSearchModalOpen] = useRecoilState(searchModalState)
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    onSnapshot(collection(db, 'users', session.user.uid, 'bookmarks'), (snapshot) => {
      setTweets(snapshot.docs)
      setLoading(false)
    })
  }, [db, loading])


  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          Bookmarks / Twitter 2.0
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen px-0 lg:px-36 xl:px-48 2xl:px-12 flex`}>
        <Sidebar />
        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2] dark:border-gray-700">
          {!loading ? (
            <div>
              <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white text-black dark:bg-black dark:text-white sticky top-0">
                <div className="">
                  <div className="flex items-center mb-0 p-0">
                    <h2 className="font-bold text-xl">Bookmarks</h2>
                  </div>

                  <div className="text-gray-400 text-sm">@{session.user.tag}</div>
                </div>
              </div>

              <div>
                {tweets.map((tweet) => (
                  <TweetWithID key={tweet.data().tweetID} tweetID={tweet.data().tweetID} />
                ))}
              </div>
            </div>
          ) : <Spinner />
          }

        </div>


        <Widgets />
        {isOpen && <NewTweetModal />}
        {isSearchModalOpen && <SearchModal />}

        <Footer />

      </main>
    </div>
  )
}

export default Followers

export async function getServerSideProps(context) {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then(
    (res) => res.json()
  );
  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then(
    (res) => res.json()
  );
  const providers = await getProviders();
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session,
    },
  };
}