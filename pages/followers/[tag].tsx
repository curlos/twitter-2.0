import { ArrowLeftIcon, BadgeCheckIcon } from '@heroicons/react/solid'
import { collection, doc, DocumentData, getDoc, getDocs, query, where } from 'firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { colorThemeState, newTweetModalState, searchModalState } from '../../atoms/atom'
import Footer from '../../components/Footer'
import MediumUser from '../../components/MediumUser'
import { NewTweetModal } from '../../components/NewTweetModal'
import { SearchModal } from '../../components/SearchModal'
import Sidebar from '../../components/Sidebar'
import Spinner from '../../components/Spinner'
import Widgets from '../../components/Widgets'
import { db } from '../../firebase'

const Followers = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [isSearchModalOpen, setIsSearchModalOpen] = useRecoilState(searchModalState)
  const [author, setAuthor] = useState<DocumentData>()
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { tag } = router.query

  useEffect(() => {
    const getFollowers = async () => {
      const q = query(collection(db, "users"), where('tag', '==', String(tag)))
      const querySnapshot = await getDocs(q)
      console.log(querySnapshot.docs)
      const userID = querySnapshot.docs[0].id

      setAuthor(querySnapshot.docs[0].data())

      const f = query(collection(db, "users", userID, "followers"))
      const queryFollowersSnapshot = await getDocs(f)
      setFollowers(queryFollowersSnapshot.docs)
      setLoading(false)
    }
    getFollowers()
  }, [db, tag, loading])


  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          {`${tag}'s`} Followers
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`bg-white text-black dark:bg-black dark:text-white px-0 lg:px-12 min-h-screen flex  `}>
        <Sidebar />
        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2]  dark:border-gray-700">
          {!loading && author ? (
            <div>
              <div className="flex items-center space-x-4 border-b border-[#AAB8C2]  dark:border-gray-700 p-2 sticky top-0">
                <div className="cursor-pointer mx-3" onClick={() => router.push(`/profile/${author.tag}`)}>
                  <ArrowLeftIcon className="h-6 w-6" />
                </div>
                <div className="">
                  <div className="flex items-center mb-0 p-0">
                    <h2 className="font-bold">{author.name}</h2>
                    <BadgeCheckIcon className="h-6 w-6 text-lightblue-500" />
                  </div>

                  <div className="text-gray-400 text-sm">@{author.tag}</div>
                </div>
              </div>

              <div className="flex">
                <Link href={`/following/${author.tag}`}>
                  <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer">
                    <div className={`${router.asPath.includes('followers') && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Followers</div>

                    {router.asPath.includes('followers') ? (
                      <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                      />
                    ) : null}
                  </div>
                </Link>

                <Link href={`/following/${author.tag}`}>
                  <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer">
                    <div className={`${router.asPath.includes('following') && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Following</div>

                    {router.asPath.includes('following') ? (
                      <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                      />
                    ) : null}
                  </div>
                </Link>
              </div>

              <div>
                {followers.map((f) => {
                  const follower = f.data()

                  console.log(follower)

                  return (
                    <MediumUser key={String(follower.followedBy)} userID={String(follower.followedBy)} />
                  )
                })}
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

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session,
    },
  };
}