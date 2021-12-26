import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { newTweetModalState, tweetIdState } from '../atoms/atom';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, serverTimestamp, setDoc, where } from '@firebase/firestore';
import { db } from '../firebase';
import { getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { Dropdown } from './Dropdown';
import { FaRetweet, FaRegComment } from 'react-icons/fa'
import { FiShare } from 'react-icons/fi'
import { HiBadgeCheck } from 'react-icons/hi'
import { RiHeart3Fill, RiHeart3Line } from 'react-icons/ri'
import Link from 'next/link';

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
  const [parentTweet, setParentTweet] = useState<DocumentData>()
  const [author, setAuthor] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)
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
    setRetweeted(retweets.findIndex((retweet) => retweet.id === session?.user.uid) !== -1)
  }, [retweets])

  useEffect(
    () => {
      console.log(tweet)
      if (tweet.parentTweet && tweet.parentTweet !== "") {
        console.log('---')
        const docRef = doc(db, "tweets", String(tweet.parentTweet))
        const docSnap = getDoc(docRef).then((snap) => {
          console.log(snap.data())
          setParentTweet(snap)
        })
        console.log('---')

      }
    }, [db, id])

  useEffect(() => {
    console.log(tweet)
    const docRef = doc(db, "users", tweet.userID)
    getDoc(docRef).then((snap) => {
      console.log(snap.data())
      setAuthor(snap.data())
      setLoading(false)
    })

  }, [db, id])

  const likeTweet = async () => {
    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid))
      await deleteDoc(doc(db, "users", session.user.uid, "likes", id))
    } else {
      await setDoc(doc(db, "tweets", id, "likes", session.user.uid), {
        username: session.user.name,
        likedAt: serverTimestamp(),
        likedBy: session.user
      })
      await setDoc(doc(db, "users", session.user.uid, "likes", id), {
        ...tweet,
        likedAt: serverTimestamp(),
        likedBy: session.user
      })
    }
  }

  const retweetTweet = async () => {
    if (retweeted) {
      await deleteDoc(doc(db, "tweets", id, "retweets", session.user.uid))
      await deleteDoc(doc(db, "users", session.user.uid, "retweets", id))
    } else {
      await setDoc(doc(db, "tweets", id, "retweets", session.user.uid), {
        username: session.user.name,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user
      })
      await setDoc(doc(db, "users", session.user.uid, "retweets", id), {
        ...tweet,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user
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
      !loading ? (
        <div className="text-base p-3 border-b border-gray-500 w-full cursor-pointer" onClick={() => router.push(`/tweet/${id}`)}>
          <div className="text-gray-500 text-sm">{tweet.retweetedBy ? (
            <div className="font-semibold ml-[63px]">
              <Link href={`/profile/${tweet.retweetedBy.tag}`}>
                <span className="flex hover:underline">
                  <FaRetweet className="h-[18px] w-[18px] mr-2 mb-2" />
                  {tweet.retweetedBy.tag === session.user.tag ? 'You retweeted' : `${tweet.retweetedBy.name} retweeted`}
                </span>
              </Link>
            </div>
          ) : null}</div>
          <div className="flex">
            <div className="mr-2" onClick={(e) => {
              e.stopPropagation()
              router.push(`/profile/${tweet.tag}`)
            }}>
              <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] object-cover max-w-none" />
            </div>
            <div className="flex flex-col justify-between w-full">
              <div className="flex justify-between w-full">
                <div className="flex">
                  <div className="flex">{author.name} <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px]" /></div>
                  <div className="text-gray-500">@{author.tag}</div>
                  <div className="text-gray-500 mx-1 font-bold">·</div>
                  {tweet.timestamp && tweet.timestamp.seconds && (
                    <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
                  )}
                </div>

                <Dropdown tweet={tweet} deleteTweet={deleteTweet} />
              </div>

              <div className="pb-3">
                {parentTweet ? (
                  <div className="text-[15px] text-gray-500">
                    Replying to
                    <span className="ml-1 text-lightblue-400">@{parentTweet.data().tag}</span>
                  </div>
                ) : null}
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
                <div className="flex-1 items-center flex space-x-2">
                  <FaRegComment className="h-[18px] w-[18px] cursor-pointer" />
                  <div>{replies.length}</div>
                </div>

                <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                  e.stopPropagation()
                  retweetTweet()
                }}>
                  {!retweeted ? <FaRetweet className={`h-[18px] w-[18px] cursor-pointer`} /> : <FaRetweet className={`h-[18px] w-[18px] cursor-pointer text-green-400`} />}
                  <div className="text-green-400">{retweets.length}</div>
                </div>


                <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                  e.stopPropagation()
                  likeTweet()
                }}>
                  {!liked ? <RiHeart3Line className={`h-[18px] w-[18px] cursor-pointer`} /> : <RiHeart3Fill className={`h-[18px] w-[18px] cursor-pointer text-red-500`} />}
                  <div className="text-red-500">{likes.length}</div>
                </div>

                <div className="flex-1">
                  <FiShare className="h-[18px] w-[18px] cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null
    ) : (
      !loading ? (
        <div className="text-base p-3 border-b border-gray-500 w-full">
          <div className="flex justify-between">
            <div className="flex">
              <div className="mr-2">
                <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] max-w-none" />
              </div>

              <div className="">
                <div className="flex">
                  <div>{author.name}</div>
                  <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px]" />
                </div>
                <div className="text-gray-400 p-0 m-0">@{author.tag}</div>
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
                <img src={tweet.image} alt="" className="rounded-2xl w-full object-contain border border-gray-800" />
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
                <FaRegComment className="h-6 w-6 cursor-pointer" />
              </div>

              <div className="flex space-x-2" onClick={(e) => {
                e.stopPropagation()
                retweetTweet()
              }}>
                {!retweeted ? <FaRetweet className={`h-6 w-6 cursor-pointer`} /> : <FaRetweet className={`h-6 w-6 cursor-pointer text-green-400`} />}
              </div>


              <div className="flex space-x-2" onClick={(e) => {
                e.stopPropagation()
                likeTweet()
              }}>
                {!liked ? <RiHeart3Line className={`h-6 w-6 cursor-pointer`} /> : <RiHeart3Fill className={`h-6 w-6 cursor-pointer text-red-500`} />}
              </div>
            </div>
          </div>
        </div>
      ) : null
    )
  )
}

export default Tweet