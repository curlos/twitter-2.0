import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { newTweetModalState, tweetIdState, colorThemeState } from '../atoms/atom';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, serverTimestamp, setDoc, where } from '@firebase/firestore';
import { db } from '../firebase';
import { getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { Dropdown } from './Dropdown';
import { FaRetweet, FaRegComment, FaBookmark, FaRegBookmark } from 'react-icons/fa'
import { FiShare } from 'react-icons/fi'
import { HiBadgeCheck } from 'react-icons/hi'
import { RiHeart3Fill, RiHeart3Line } from 'react-icons/ri'
import Link from 'next/link';

interface Props {
  id: string,
  tweet: any,
  tweetID: any,
  tweetPage?: boolean
  topParentTweet?: boolean
}

const Tweet = ({ id, tweet, tweetID, tweetPage, topParentTweet }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweetId, setTweetId] = useRecoilState(tweetIdState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [likes, setLikes] = useState([])
  const [retweets, setRetweets] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [replies, setReplies] = useState([])
  const [liked, setLiked] = useState(false)
  const [retweeted, setRetweeted] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [parentTweet, setParentTweet] = useState<DocumentData>()
  const [parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>()
  const [author, setAuthor] = useState<DocumentData>()
  const [retweetedBy, setRetweetedBy] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    onSnapshot(query(
      collection(db, 'tweets', String(tweetID), 'replies'),
      orderBy('timestamp', 'desc')
    ),
      (snapshot) => setReplies(snapshot.docs))
  }, [db, id, tweetID])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'likes'), (snapshot) => setLikes(snapshot.docs))
  }, [db, id, tweetID])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'retweets'), (snapshot) => setRetweets(snapshot.docs))
  }, [db, id, tweetID])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'replies'), (snapshot) => setReplies(snapshot.docs))
  }, [db, id, tweetID])

  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'bookmarks'), (snapshot) => setBookmarks(snapshot.docs))
  }, [db, id, tweetID])

  useEffect(() => {
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1)
  }, [likes])

  useEffect(() => {
    setRetweeted(retweets.findIndex((retweet) => retweet.id === session?.user.uid) !== -1)
  }, [retweets])

  useEffect(() => {
    setBookmarked(bookmarks.findIndex((bookmark) => bookmark.id === session?.user.uid) !== -1)
  }, [bookmarks])

  useEffect(() => {
    const docRef = doc(db, "users", tweet.userID)
    getDoc(docRef).then((snap) => {
      setAuthor(snap.data())
      setLoading(false)
    })
  }, [db, id])

  useEffect(
    () => {
      if (tweet.parentTweet && tweet.parentTweet !== "") {
        const docRef = doc(db, "tweets", String(tweet.parentTweet))
        getDoc(docRef).then((snap) => {
          setParentTweet(snap)
        })
      }
    }, [db, id])

  useEffect(() => {
    if (parentTweet) {
      const docRef = doc(db, "users", String(parentTweet.data().userID))
      getDoc(docRef).then((snap) => {
        setParentTweetAuthor(snap.data())
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [db, id, parentTweet])

  useEffect(() => {
    if (tweet.retweetedBy) {
      const docRef = doc(db, "users", tweet.retweetedBy)
      getDoc(docRef).then((snap) => {
        setRetweetedBy(snap.data())
        setLoading(false)
      })
    }
  }, [tweet.retweetedBy])



  const likeTweet = async () => {
    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid))
      await deleteDoc(doc(db, "users", session.user.uid, "likes", id))
    } else {
      await setDoc(doc(db, "tweets", id, "likes", session.user.uid), {
        name: session.user.name,
        likedAt: serverTimestamp(),
        likedBy: session.user.uid
      })
      await setDoc(doc(db, "users", session.user.uid, "likes", id), {
        ...tweet,
        likedAt: serverTimestamp(),
        likedBy: session.user.uid
      })
    }
  }

  const retweetTweet = async () => {
    if (retweeted) {
      await deleteDoc(doc(db, "tweets", id, "retweets", session.user.uid))
      await deleteDoc(doc(db, "users", session.user.uid, "retweets", id))
    } else {
      await setDoc(doc(db, "tweets", id, "retweets", session.user.uid), {
        name: session.user.name,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user.uid
      })
      await setDoc(doc(db, "users", session.user.uid, "retweets", id), {
        ...tweet,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user.uid
      })
    }
  }

  const bookmarkTweet = async () => {
    console.log('hello')

    if (bookmarked) {
      console.log('bookmarked')
      await deleteDoc(doc(db, "tweets", id, "bookmarks", session.user.uid))
      await deleteDoc(doc(db, "users", session.user.uid, "bookmarks", id))
    } else {
      console.log('not')
      await setDoc(doc(db, "tweets", id, "bookmarks", session.user.uid), {
        userID: session.user.uid
      })
      await setDoc(doc(db, "users", session.user.uid, "bookmarks", id), {
        tweetID: id
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
      !loading && author ? (
        <div className={`${theme} max-w-full text-base p-3 w-full cursor-pointer ${!topParentTweet ? 'border-b border-[#AAB8C2]  dark:border-gray-700' : ''}`}>
          <Link href={`/tweet/${tweetID}`}>
            <div>
              <div className="text-gray-500 text-sm">{retweetedBy ? (
                <div className="font-semibold ml-[63px]">
                  <Link href={`/profile/${retweetedBy.tag}`}>
                    <span className="flex hover:underline">
                      <FaRetweet className="h-[18px] w-[18px] mr-2 mb-2" />
                      {retweetedBy.tag === session.user.tag ? 'You retweeted' : `${retweetedBy.name} retweeted`}
                    </span>
                  </Link>
                </div>
              ) : null}</div>
              <div className="flex">
                <div className="mr-2">
                  <Link href={`/profile/${author.tag}`}>
                    <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer" />
                  </Link>
                </div>
                <div className="flex flex-col justify-between w-full">
                  <div className="flex justify-between w-full">
                    <div className="lg:flex">
                      <div className="flex">
                        <Link href={`/profile/${author.tag}`}>
                          <div className="cursor-pointer hover:underline font-bold">{author.name}</div>
                        </Link>
                        <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
                      </div>
                      <div className="text-gray-500">@{author.tag}</div>
                      <div className="hidden lg:block text-gray-500 mx-1 font-bold">·</div>
                      {tweet.timestamp && tweet.timestamp.seconds && (
                        <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
                      )}
                    </div>

                    <Dropdown tweet={tweet} author={author} deleteTweet={deleteTweet} />
                  </div>

                  <div className="pb-3">
                    {parentTweet && parentTweetAuthor ? (
                      <div className="text-[15px] text-gray-500">
                        Replying to
                        <Link href={`/profile/${author.tag}`}>
                          <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@{parentTweetAuthor.tag}</span>
                        </Link>
                      </div>
                    ) : null}
                    <div className="break-words max-w-[300px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px]">{tweet.text}</div>
                    {tweet.image && (
                      <div className="pt-3">
                        <img src={tweet.image} alt="" className="rounded-2xl max-h-[500px] object-contain" />
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

                    <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                      e.stopPropagation()
                      bookmarkTweet()
                    }}>
                      {bookmarked ? (
                        <FaBookmark className={`h-[18px] w-[18px] cursor-pointer text-yellow-500`} />
                      ) : (
                        <FaRegBookmark className={`h-[18px] w-[18px] cursor-pointer`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : null
    ) : (
      !loading && author ? (
        <div className="text-base p-3 border-b border-[#AAB8C2]  dark:border-gray-700 w-full">
          <div className="flex justify-between">
            <div className="flex">
              <Link href={`/profile/${author.tag}`}>
                <div className="mr-2">
                  <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] max-w-none cursor-pointer" />
                </div>
              </Link>

              <div className="">
                <Link href={`/profile/${author.tag}`}>
                  <div className="flex">
                    <div className="cursor-pointer hover:underline">{author.name}</div>
                    <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
                  </div>
                </Link>
                <div className="text-gray-400 p-0 m-0">@{author.tag}</div>
              </div>
            </div>

            <Dropdown tweet={tweet} author={author} deleteTweet={deleteTweet} />
          </div>

          <div className="text-xl py-3">
            {parentTweet && parentTweetAuthor ? (
              <div className="text-[15px] text-gray-500">
                <span>Replying to</span>
                <Link href={`/profile/${author.tag}`}>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@{parentTweetAuthor.tag}</span>
                </Link>
              </div>
            ) : null}
            <div className="break-words max-w-[350px] lg:max-w-[700px] xl:max-w-[670px] 2xl:max-w-[850px]">{tweet.text}</div>
            {tweet.image && (
              <div className="pt-3">
                <img src={tweet.image} alt="" className="rounded-2xl w-full object-contain border border-[#AAB8C2]  dark:border-gray-700" />
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

              <div className="flex space-x-2" onClick={(e) => {
                e.stopPropagation()
                bookmarkTweet()
              }}>
                {bookmarked ? (
                  <FaBookmark className={`h-6 w-6 cursor-pointer text-yellow-500`} />
                ) : (
                  <FaRegBookmark className={`h-6 w-6 cursor-pointer`} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null
    )
  )
}

export default Tweet