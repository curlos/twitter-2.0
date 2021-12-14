import { doc, DocumentData, onSnapshot } from '@firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from "../../firebase"
import { useRecoilState } from 'recoil'
import { newTweetModalState } from '../../atoms/atom'
import Head from 'next/head'
import Sidebar from '../../components/Sidebar'
import { NewTweetModal } from '../../components/NewTweetModal'
import { BadgeCheckIcon, ArrowLeftIcon, DotsHorizontalIcon } from '@heroicons/react/solid'
import Tweet from '../../components/Tweet'
import { collection, orderBy, query, where } from 'firebase/firestore'
import Widgets from '../../components/Widgets'
import { CalendarIcon, LinkIcon, LocationMarkerIcon } from '@heroicons/react/outline'
import Feed from '../../components/Feed'
import Tweets from '../../components/Tweets'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const ProfilePage = ({ trendingResults, followResults, providers }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('Tweets')
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  // useEffect(
  //   () =>
  //     onSnapshot(doc(db, "tweets", String(id)), (snapshot) => {
  //       console.log(snapshot)
  //       setTweet(snapshot.data());
  //     }),
  //   [db, id]
  // )

  // useEffect(
  //   () =>
  //     onSnapshot(
  //       query(
  //         collection(db, "tweets"),
  //         where("parentTweet", "==", id),
  //         orderBy("timestamp", "desc"),
  //       ),
  //       (snapshot) => {
  //         console.log(snapshot)
  //         setReplies(snapshot.docs)
  //         setLoading(false)
  //       }
  //     ),
  //   [db, id]
  // )


  return (
    <div className="px-12 min-h-screen min-w-screen">
      <Head>
        <title>
          Twitter 2.0
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />

        {loading ? <div>Loading...</div> : (
          <div className="flex-grow lg:ml-[280px] text-lg border-r border-gray-500">
            <div className="flex items-center space-x-4 border-b border-gray-500 p-2 bg-black sticky top-0">
              <div className="cursor-pointer mx-3" onClick={() => router.push('/')}>
                <ArrowLeftIcon className="h-6 w-6" />
              </div>
              <div className="">
                <div className="flex items-center mb-0 p-0">
                  <h2 className="font-bold">Los Angeles Lakers</h2>
                  <BadgeCheckIcon className="h-6 w-6" />
                </div>

                <div className="text-gray-400 text-sm">74.6K Tweets</div>
              </div>
            </div>

            <div>
              <img src="/assets/profile_banner.jpg" alt="" />
            </div>

            <div className="flex justify-between items-start p-4 pb-0">
              <img src="/assets/profile_icon.jpeg" alt="" className="rounded-full h-[133.5px] w-[133.5px] border-2 border-gray-500 mt-[-88px]" />

              <div className="flex space-x-2">
                <div className="flex justify-center items-center p-2 border border-gray-500 rounded-full w-10 h-10">
                  <DotsHorizontalIcon className="h-5 w-5" />
                </div>

                <div className="flex justify-center items-center p-2 border border-gray-500 rounded-full w-10 h-10">
                  <DotsHorizontalIcon className="h-5 w-5" />
                </div>

                <div className="flex justify-center items-center p-2 px-4 border border-gray-500 rounded-full">
                  Following
                </div>
              </div>


            </div>

            <div className="p-4 pt-2">
              <div className="flex items-center">
                <h2 className="text-xl font-[900]">Los Angeles Lakers</h2>
                <BadgeCheckIcon className="h-5 w-5" />
              </div>

              <div className="text-base text-gray-500">@Lakers</div>

              <div className="text-base">Welcome to the #LakeShow | 17x Champions</div>

              <div className="flex text-base text-gray-500 space-x-4 py-2">
                <div className="flex text-gray-500 space-x-1">
                  <LocationMarkerIcon className="h-5 w-5" />
                  <div className="">Los Angeles, CA</div>
                </div>

                <div className="flex space-x-1">
                  <LinkIcon className="h-5 w-5" />
                  <a href="http://lakers.com/" target="_blank" className="text-lightblue-400 hover:underline">lakers.com</a>
                </div>

                <div className="flex space-x-1">
                  <CalendarIcon className="h-5 w-5" />
                  <div className="">Joined February 2009</div>
                </div>

              </div>

              <div className="text-gray-500 text-base flex space-x-4">
                <div className="space-x-1">
                  <span className="text-white font-bold">75</span>
                  <span>Following</span>
                </div>

                <div className="space-x-1">
                  <span className="text-white font-bold">10.3M</span>
                  <span>Followers</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 flex space-x-3 py-3">
                <div className="flex">
                  <img src="/assets/halsey.jpeg" alt="" className="h-[18px] border border-white rounded-full z-50" />
                  <img src="/assets/halsey.jpeg" alt="" className="h-[18px] border border-white rounded-full ml-[-7px] z-40" />
                  <img src="/assets/halsey.jpeg" alt="" className="h-[18px] border border-white rounded-full ml-[-7px]" />
                </div>
                <div>Followed by halsey and1, Sports Section, and 10 others you follow</div>
              </div>

              <div className="flex text-base text-gray-500 space-x-3">
                <div className={`${filter === 'Tweets' && 'text-white font-bold border-b-4 border-lightblue-400'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
              </div>

              <Tweets />
            </div>
          </div>
        )}

        <Widgets />
        {isOpen && <NewTweetModal />}
      </main>


    </div>
  )
}

export default ProfilePage

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