import { deleteDoc, doc, DocumentData, getDoc, getDocs, onSnapshot, serverTimestamp } from '@firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from "../../firebase"
import { useRecoilState } from 'recoil'
import { colorThemeState, newTweetModalState, searchModalState, settingsModalState } from '../../atoms/atom'
import Head from 'next/head'
import Sidebar from '../../components/Sidebar'
import { NewTweetModal } from '../../components/NewTweetModal'
import { BadgeCheckIcon, ArrowLeftIcon, DotsHorizontalIcon } from '@heroicons/react/solid'
import Tweet from '../../components/Tweet'
import { collection, orderBy, query, setDoc, where } from 'firebase/firestore'
import Widgets from '../../components/Widgets'
import { CalendarIcon, LinkIcon, LocationMarkerIcon } from '@heroicons/react/outline'
import Tweets from '../../components/Tweets'
import moment from 'moment'
import SettingsModal from '../../components/SettingsModal'
import Spinner from '../../components/Spinner'
import Link from 'next/link'
import Footer from '../../components/Footer'
import { SearchModal } from '../../components/SearchModal'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const ProfilePage = ({ trendingResults, followResults, providers }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [isSearchModalOpen, setIsSearchModalOpen] = useRecoilState(searchModalState)
  const [loading, setLoading] = useState(true)
  const [tweetsLoading, setTweetsLoading] = useState(true)
  const [filter, setFilter] = useState('Tweets')
  const [author, setAuthor] = useState(null)
  const [authorID, setAuthorID] = useState('')
  const [tweets, setTweets] = useState([])
  const [retweets, setRetweets] = useState([])
  const [likes, setLikes] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followersYouFollow, setFollowersYouFollow] = useState([])
  const [isSettingsModalOpen, setSettingsModalOpen] = useRecoilState(settingsModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)

  const [followed, setFollowed] = useState(false)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    setLoading(true)

    const fetchFromDB = async () => {
      const userQuery = query(collection(db, "users"), where('tag', '==', id))
      const userQuerySnapshot = await getDocs(userQuery)

      setAuthor(userQuerySnapshot.docs[0].data())
      setAuthorID(userQuerySnapshot.docs[0].id)
      setLoading(false)
    }
    fetchFromDB()
  }, [db, id])

  useEffect(() => {
    if (!loading) {
      setTweetsLoading(true)
      fetchTweetsInfo(authorID).then(() => setTweetsLoading(false))
    }
  }, [db, id, loading, filter])

  useEffect(() => {
    if (!loading) {
      onSnapshot(collection(db, 'users', authorID, 'followers'), (snapshot) => setFollowers(snapshot.docs))
    }
  }, [db, id, loading])

  useEffect(() => {
    if (!loading) {
      onSnapshot(collection(db, 'users', authorID, 'following'), (snapshot) => setFollowing(snapshot.docs))
    }
  }, [db, id, loading])

  useEffect(() => {
    if (!loading) {
      onSnapshot(collection(db, 'users', session.user.uid, 'following'), async (snapshot) => {
        let newFollowersYouFollow = []
        for (let user of snapshot.docs) {
          console.log(user.data())
          const docRef = doc(db, "users", user.data().followingID)
          const snap = await getDoc(docRef)
          const follower = snap.data()
          newFollowersYouFollow.push(follower)
        }

        setFollowersYouFollow(newFollowersYouFollow.filter((user) => user.tag !== author.tag))
      })
    }
  }, [db, id, loading])

  useEffect(() => {
    setFollowed(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1)
  }, [followers])

  const fetchTweetsInfo = async (authorID) => {
    const tweetsQuery = query(collection(db, "tweets"),
      where('userID', '==', authorID),
      orderBy('timestamp', 'desc')
    )
    const tweetsQuerySnapshot = await getDocs(tweetsQuery)
    console.log(tweetsQuerySnapshot)
    setTweets(tweetsQuerySnapshot.docs)

    const retweetsQuery = query(collection(db, 'users', authorID, 'retweets'))
    const retweetsQuerySnapshot = await getDocs(retweetsQuery)
    setRetweets(retweetsQuerySnapshot.docs)

    const likesQuery = query(collection(db, 'users', authorID, 'likes'))
    const likesQuerySnapshot = await getDocs(likesQuery)
    setLikes(likesQuerySnapshot.docs)
  }

  const handleFollow = async () => {
    console.log(followed)
    if (followed) {
      await deleteDoc(doc(db, "users", authorID, "followers", String(session.user.uid)))
      await deleteDoc(doc(db, "users", String(session.user.uid), "following", authorID))
    } else {
      await setDoc(doc(db, "users", authorID, "followers", String(session.user.uid)), {
        followedAt: serverTimestamp(),
        followedBy: session.user.uid
      })
      await setDoc(doc(db, "users", String(session.user.uid), "following", authorID), {
        followedAt: serverTimestamp(),
        followingID: authorID
      })
    }
  }

  const handleEditOrFollow = () => {
    session.user.tag === String(id) ? setSettingsModalOpen(true) : handleFollow()
  }

  console.log(followersYouFollow)

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          Twitter 2.0
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>



      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white px-0 lg:px-12 min-h-screen flex  `}>
        <Sidebar />

        {loading ? (
          <div className="flex justify-center mt-4 flex-grow sm:ml-[80px] xl:ml-[280px] w-full">
            <Spinner />
          </div>
        ) : (
          author && <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2] dark:border-gray-700">
            <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white dark:bg-black sticky top-0 z-[50]">
              <div className="cursor-pointer mx-3" onClick={() => router.push('/')}>
                <ArrowLeftIcon className="h-6 w-6" />
              </div>
              <div className="">
                <div className="flex items-center mb-0 p-0">
                  <h2 className="font-bold">{author.name}</h2>
                  <BadgeCheckIcon className="h-6 w-6 text-lightblue-500" />
                </div>

                <div className="text-gray-400 text-sm">{tweets.length} Tweets</div>
              </div>
            </div>

            <div>
              <img src={author.banner || "/assets/profile_banner.jpg"} alt="" className="w-full max-h-[225px] object-cover" />
            </div>

            <div className="flex justify-between items-start p-4 pb-0">
              <img src={author.profilePic} alt="" className="rounded-full h-[133.5px] w-[133.5px] border-4 border-white dark:border-black mt-[-88px] object-cover" />

              <div className="flex items-center space-x-2">
                <div className="flex justify-center items-center p-2 border-2 border-[#AAB8C2] dark:border-gray-700 rounded-full w-10 h-10">
                  <DotsHorizontalIcon className="h-5 w-5" />
                </div>

                <div className="flex justify-center items-center p-2 px-4 border-2 border-[#AAB8C2] dark:border-gray-700 rounded-full cursor-pointer" onClick={handleEditOrFollow}>
                  {session.user.tag === String(id) ? 'Edit Profile' : (followed ? 'Following' : 'Follow')}
                </div>
              </div>


            </div>

            <div className="p-4 pt-2">
              <div className="flex items-center">
                <h2 className="text-xl font-[900]">{author.name}</h2>
                <BadgeCheckIcon className="h-5 w-5 text-lightblue-500" />
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
                <Link href={{
                  pathname: `/following/[tag]`,
                  query: { tag: author.tag || 't' }
                }}>
                  <div className="space-x-1 cursor-pointer hover:underline">
                    <span className="text-black dark:text-white font-bold">{following.length}</span>
                    <span>Following</span>
                  </div>
                </Link>


                <Link href={{
                  pathname: `/followers/[tag]`,
                  query: { tag: author.tag || 't' }
                }}>
                  <div className="space-x-1 cursor-pointer hover:underline">
                    <span className="text-black dark:text-white font-bold">{followers.length}</span>
                    <span>Followers</span>
                  </div>
                </Link>
              </div>

              {followersYouFollow && followersYouFollow.length ? (
                <div className="text-sm text-gray-500 flex space-x-3 py-3">
                  <div className="flex">
                    {followersYouFollow.slice(0, 3).map((user, i) => (
                      <Link href={`/profile/${user.tag}`}>
                        <img src={user.profilePic} alt="" className={`h-[18px] w-[18px] cursor-pointer border border-white rounded-full z-50 ${i > 0 ? 'ml-[-9px]' : ''}`} />
                      </Link>
                    ))}
                  </div>
                  <div>
                    Followed by {followersYouFollow.slice(0, 3).map((follower, i) => (
                      <span>
                        <Link href={`/profile/${follower.tag}`}>
                          <span className="cursor-pointer hover:underline">{follower.name}
                          </span>
                        </Link>
                        <span>
                          {i === followersYouFollow.slice(0, 3).length - 1 ? '' : ', '}
                        </span>
                      </span>

                    ))} {followersYouFollow.length > followersYouFollow.slice(0, 3).length ? `, and ${followersYouFollow.length - followersYouFollow.slice(0, 3).length} ${(followersYouFollow.length - followersYouFollow.slice(0, 3).length) > 1 ? 'others' : 'other'} you follow` : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex">
              <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 ml-2 cursor-pointer" onClick={() => setFilter('Tweets')}>
                <div className={`${filter === 'Tweets' && 'text-black dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets</div>
                {filter === 'Tweets' ? (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                  />
                ) : null}
              </div>

              <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer" onClick={() => setFilter('Tweets & Replies')}>
                <div className={`${filter === 'Tweets & Replies' && 'text-black dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Tweets & Replies</div>

                {filter === 'Tweets & Replies' ? (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                  />
                ) : null}
              </div>

              <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer" onClick={() => setFilter('Media')}>
                <div className={`${filter === 'Media' && 'text-black dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Media</div>

                {filter === 'Media' ? (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                  />
                ) : null}
              </div>

              <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer" onClick={() => setFilter('Likes')}>
                <div className={`${filter === 'Likes' && 'text-black dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Likes</div>

                {filter === 'Likes' ? (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                  />
                ) : null}
              </div>

            </div>

            <div className="w-full h-[1px] m-0 bg-gray-700 rounded-full"
            />

            {tweetsLoading ? (
              <div className='flex justify-center items-center min-h-[70vh]'>
                <Spinner />
              </div>
            ) : (
              <Tweets author={author} tweets={tweets} retweets={retweets} likes={likes} filter={filter} />
            )}
          </div>
        )}

        <Widgets />
        {isOpen && <NewTweetModal />}
        {isSettingsModalOpen && <SettingsModal />}
        {isSearchModalOpen && <SearchModal />}

        <Footer />
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