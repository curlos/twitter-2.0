import React, { useEffect, useState } from 'react'
import { BadgeCheckIcon, DotsHorizontalIcon, ShareIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/solid'
import { ChatIcon, SwitchVerticalIcon, HeartIcon as HeartIconOutline, SwitchHorizontalIcon, } from '@heroicons/react/outline'
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { newTweetModalState, tweetIdState } from '../atoms/atom';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, setDoc, where } from '@firebase/firestore';
import { db } from '../firebase';
import { getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { Dropdown } from './Dropdown';
import Head from 'next/head';

interface Props {
  id: string,
  tweet: any,
  tweetPage?: boolean
  parentTweet?: Object
}

const Tweet = ({ id, tweet, tweetPage }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweetId, setTweetId] = useRecoilState(tweetIdState)
  const [likes, setLikes] = useState([])
  const [retweets, setRetweets] = useState([])
  const [replies, setReplies] = useState([])
  const [liked, setLiked] = useState(false)
  const [retweeted, setRetweeted] = useState(false)
  const [author, setAuthor] = useState<DocumentData>()
  const router = useRouter()

  useEffect(() => {
    onSnapshot(query(
      collection(db, 'tweets', id, 'replies'),
      orderBy('timestamp', 'desc')
    ),
      (snapshot) => setReplies(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', id, 'likes'), (snapshot) => setLikes(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', id, 'retweets'), (snapshot) => setRetweets(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', id, 'replies'), (snapshot) => setReplies(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1)
  }, [likes])

  useEffect(() => {
    setRetweeted(retweets.findIndex((retweet) => retweet.id === session?.user.uid) !== -1)
  }, [retweets])

  useEffect(() => {
    const fetchFromDB = async () => {
      console.log(tweet)
      const userDocRef = doc(db, 'users', tweet.userID)
      const userSnap = await getDoc(userDocRef)

      if (userSnap.exists()) {
        console.log(userSnap.data())
      } else {
        console.log('No such document!')
      }


      // const querySnapshot = await getDocs(collection(userDoc))
      // onSnapshot(
      //   query(collection(db, "users"), where('id', '==', tweet.userID)),
      //   (snapshot) => {
      //     console.log(snapshot.docs[0].data())
      //   }
      // )
    }

    fetchFromDB()
  }, [db])

  const likeTweet = async () => {
    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid))
    } else {
      await setDoc(doc(db, "tweets", id, "likes", session.user.uid), {
        username: session.user.name,
      })
    }
  }

  const retweetTweet = async () => {
    if (retweeted) {
      await deleteDoc(doc(db, "tweets", id, "retweets", session.user.uid))
    } else {
      await setDoc(doc(db, "tweets", id, "retweets", session.user.uid), {
        username: session.user.name,
      })
    }
  }

  const deleteTweet = async (e) => {
    e.stopPropagation()
    deleteDoc(doc(db, 'tweets', id))
    router.push('/')
  }

  return (
    !tweetPage ? (
      <div className="text-base p-3 border-b border-gray-500 w-full cursor-pointer" onClick={() => router.push(`/tweet/${id}`)}>
        <div className="flex">
          <div className="mr-2" onClick={(e) => {
            e.stopPropagation()
            router.push(`/profile/${tweet.tag}`)
          }}>
            <img src={tweet.userImg} alt={tweet.username} className="rounded-full h-[55px] w=[55px] max-w-none" />
          </div>
          <div className="flex flex-col justify-between w-full">
            <div className="flex justify-between w-full">
              <div className="flex">
                <div className="flex">{tweet.username} <BadgeCheckIcon className="h-5 w-5 ml-[2px]" /></div>
                <div className="text-gray-500">@{tweet.tag}</div>
                <div className="text-gray-500 mx-1 font-bold">·</div>
                {tweet.timestamp && tweet.timestamp.seconds && (
                  <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
                )}
              </div>

              <Dropdown tweet={tweet} deleteTweet={deleteTweet} />
            </div>

            <div className="pb-3">
              {/* {parentTweet && (
                <div className="text-[15px] text-gray-500">
                  Replying to
                  <span className="ml-1 text-lightblue-400">@{parentTweet}</span>
                </div>
              )} */}
              <div>{tweet.text}</div>
              {tweet.image && (
                <div className="pt-3">
                  <img src={tweet.image} alt="" className="rounded-2xl max-h-80 object-contain" />
                </div>
              )}
            </div>

            <div className="flex justify-start w-full text-gray-500" onClick={(e) => {
              e.stopPropagation()
              setTweetId(id)
              setIsOpen(true)
            }}>
              <div className="flex-1 flex space-x-2">
                <ChatIcon className="h-5 w-5 cursor-pointer" />
                <div>{replies.length}</div>
              </div>

              <div className="flex-1 flex space-x-2" onClick={(e) => {
                e.stopPropagation()
                retweetTweet()
              }}>
                {!retweeted ? <SwitchHorizontalIcon className={`h-5 w-5 cursor-pointer`} /> : <SwitchHorizontalIcon className={`h-5 w-5 cursor-pointer text-green-400`} />}
                <div className="text-green-400">{retweets.length}</div>
              </div>


              <div className="flex-1 flex space-x-2" onClick={(e) => {
                e.stopPropagation()
                likeTweet()
              }}>
                {!liked ? <HeartIconOutline className={`h-5 w-5 cursor-pointer`} /> : <HeartIconSolid className={`h-5 w-5 cursor-pointer text-red-400`} />}
                <div className="text-red-400">{likes.length}</div>
              </div>

              <div className="flex-1">
                <ShareIcon className="h-5 w-5 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-base p-3 border-b border-gray-500 w-full">
        <div className="flex justify-between">
          <div className="flex">
            <div className="mr-2">
              <img src={tweet.userImg} alt={tweet.username} className="rounded-full h-[55px] w=[55px] max-w-none" />
            </div>

            <div className="">
              <div className="flex">
                <div>{tweet.username}</div>
                <BadgeCheckIcon className="h-5 w-5 ml-[2px]" />
              </div>
              <div className="text-gray-400 p-0 m-0">@{tweet.tag}</div>
            </div>
          </div>

          <Dropdown tweet={tweet} deleteTweet={deleteTweet} />
        </div>

        <div className="text-xl py-3">
          {/* {parentTweet && (
            <div className="text-[15px] text-gray-500">
              Replying to
              <span className="ml-1 text-lightblue-400">@{parentTweet}</span>
            </div>
          )} */}
          <div>{tweet.text}</div>
          {tweet.image && (
            <div className="pt-3">
              <img src={tweet.image} alt="" className="rounded-2xl w-full object-contain border border-gray-500" />
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-500">
          <div className="flex py-2">
            <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).format('LT')}</div>
            <div className="text-gray-500 mx-1 font-bold">·</div>
            <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).format('ll')}</div>
            <div className="text-gray-500 mx-1 font-bold">·</div>
            <div className="text-gray-500">Twitter for Web</div>
          </div>

          <div className="flex space-x-4 py-2">
            <div className="space-x-1">
              <span className="font-bold">{replies.length}</span>
              <span className="text-gray-500">Replies</span>
            </div>

            <div className="space-x-1">
              <span className="font-bold">{retweets.length}</span>
              <span className="text-gray-500">Retweets</span>
            </div>

            <div className="space-x-1">
              <span className="font-bold">{likes.length}</span>
              <span className="text-gray-500">Likes</span>
            </div>
          </div>

          <div className="flex justify-between w-full text-gray-500 py-2 px-12" onClick={(e) => {
            e.stopPropagation()
            setTweetId(id)
            setIsOpen(true)
          }}>
            <div className="flex space-x-2">
              <ChatIcon className="h-6 w-6 cursor-pointer" />
            </div>

            <div className="flex space-x-2" onClick={(e) => {
              e.stopPropagation()
              retweetTweet()
            }}>
              {!retweeted ? <SwitchHorizontalIcon className={`h-6 w-6 cursor-pointer`} /> : <SwitchHorizontalIcon className={`h-6 w-6 cursor-pointer text-green-400`} />}
            </div>


            <div className="flex space-x-2" onClick={(e) => {
              e.stopPropagation()
              likeTweet()
            }}>
              {!liked ? <HeartIconOutline className={`h-6 w-6 cursor-pointer`} /> : <HeartIconSolid className={`h-6 w-6 cursor-pointer text-red-400`} />}
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default Tweet
