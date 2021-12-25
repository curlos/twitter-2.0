import { doc, DocumentData, getDocs, onSnapshot } from '@firebase/firestore'
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
import moment from 'moment'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const ProfilePage = ({ trendingResults, followResults, providers }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Tweets')
  const [author, setAuthor] = useState(null)
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  useEffect(() => {
    const fetchFromDB = async () => {
      const q = query(collection(db, "users"), where('tag', '==', id))
      const querySnapshot = await getDocs(q)
      setAuthor(querySnapshot.docs[0].data())
      setLoading(false)
    }
    fetchFromDB()
  }, [])


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
                  <h2 className="font-bold">{author.username}</h2>
                  <BadgeCheckIcon className="h-6 w-6" />
                </div>

                <div className="text-gray-400 text-sm">74.6K Tweets</div>
              </div>
            </div>

            <div>
              <img src="/assets/profile_banner.jpg" alt="" />
            </div>

            <div className="flex justify-between items-start p-4 pb-0">
              <img src={author.userImg} alt="" className="rounded-full h-[133.5px] w-[133.5px] border-4 border-black mt-[-88px]" />

              <div className="flex items-center space-x-2">
                <div className="flex justify-center items-center p-2 border-2 border-gray-500 rounded-full w-10 h-10">
                  <DotsHorizontalIcon className="h-5 w-5" />
                </div>

                <div className="flex justify-center items-center p-2 px-4 border-2 border-gray-500 rounded-full">
                  {session.user.tag === id ? 'Edit Profile' : 'Follow'}
                </div>
              </div>


            </div>

            <div className="p-4 pt-2">
              <div className="flex items-center">
                <h2 className="text-xl font-[900]">{author.username}</h2>
                <BadgeCheckIcon className="h-5 w-5" />
              </div>

              <div className="text-base text-gray-500">@{author.tag}</div>

              <div className="text-base">{author.bio}</div>

              <div className="flex text-base text-gray-500 space-x-4 py-2">
                {author.location ? (
                  <div className="flex text-gray-500 space-x-1">
                    <LocationMarkerIcon className="h-5 w-5" />
                    <div className="">{author.location}</div>
                  </div>
                ) : null}

                {author.website ? (
                  <div className="flex space-x-1">
                    <LinkIcon className="h-5 w-5" />
                    <a href="http://lakers.com/" target="_blank" className="text-lightblue-400 hover:underline">{author.website}</a>
                  </div>
                ) : null}

                <div className="flex space-x-1">
                  <CalendarIcon className="h-5 w-5" />
                  <div className="">Joined {moment(new Date(author.dateJoined.seconds * 1000)).format('MMMM YYYY')}</div>
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
            </div>

            <div className="flex">
              <div className="flex flex-col items-center flex-1 text-base text-gray-500 mr-2 ml-2">
                <div className={`${filter === 'Tweets' && 'text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
                <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                />
              </div>

              <div className="flex flex-col items-center flex-1 text-base text-gray-500 mr-2">
                <div className={`${filter === 'Tweets' && 'text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
                <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                />
              </div>

              <div className="flex flex-col items-center flex-1 text-base text-gray-500 mr-2">
                <div className={`${filter === 'Tweets' && 'text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
                <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                />
              </div>

              <div className="flex flex-col items-center flex-1 text-base text-gray-500 mr-2">
                <div className={`${filter === 'Tweets' && 'text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
                <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                />
              </div>

            </div>

            <div className="w-full h-[1px] m-0 bg-gray-400 rounded-full"
            />

            <Tweets />
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