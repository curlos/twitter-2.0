import React, { useEffect, useState } from 'react'
import { BadgeCheckIcon, DotsHorizontalIcon, ShareIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/solid'
import { ChatIcon, SwitchVerticalIcon, HeartIcon as HeartIconOutline, SwitchHorizontalIcon, } from '@heroicons/react/outline'
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { newTweetModalState, tweetIdState } from '../atoms/atom';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from '@firebase/firestore';
import { db } from '../firebase';
import { orderBy, query } from 'firebase/firestore';
import { Dropdown } from './Dropdown';

interface Props {
  id: string,
  tweet: any
}

const Tweet = ({ id, tweet }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweetId, setTweetId] = useRecoilState(tweetIdState)
  const [replies, setReplies] = useState([])
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
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
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1)
  }, [likes])

  const likeTweet = async () => {
    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid))
    } else {
      await setDoc(doc(db, "tweets", id, "likes", session.user.uid), {
        username: session.user.name,
      })
    }
  }

  const deleteTweet = async (e) => {
    e.stopPropagation()
    deleteDoc(doc(db, 'tweets', id))
    router.push('/')
  }

  console.log(id)

  return (
    <div className="text-base p-3 border-b border-gray-500 w-full cursor-pointer" onClick={() => router.push(`/${id}`)}>
      <div className="flex">
        <div className="mr-2">
          <img src={tweet.userImg} alt={tweet.username} height={60} width={60} className="rounded-full h-[55px] w=[55px]" />
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
            <div className="flex-1">
              <ChatIcon className="h-5 w-5 cursor-pointer" />
              {tweet.replies && tweet.replies.length}
            </div>

            <div className="flex-1">
              <SwitchHorizontalIcon className="h-5 w-5 cursor-pointer" />
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
      {/* {post.text} */}
    </div>
  )
}

export default Tweet
