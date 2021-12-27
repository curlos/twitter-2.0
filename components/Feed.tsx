import React, { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/outline'
import { db } from "../firebase";
import Input from './Input'
import { useSession } from 'next-auth/react';
import { onSnapshot, query } from '@firebase/firestore';
import { collection, orderBy } from 'firebase/firestore';
import Tweet from './Tweet';
import Widgets from './Widgets';
import { useRecoilState } from 'recoil';
import { newTweetModalState } from '../atoms/atom';
import { FaFeatherAlt } from 'react-icons/fa';

const Feed = () => {

  const { data: session } = useSession()
  const [tweets, setTweets] = useState([])
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [loading, setLoading] = useState(true)

  useEffect(() => onSnapshot(
    query(collection(db, "tweets"), orderBy("timestamp", "desc")),
    (snapshot) => {
      setTweets(snapshot.docs)
      setLoading(false)
    }
  ), [db])

  console.log(session)

  return (
    loading ? <div>Loading...</div> : (
      <div className="flex-grow lg:ml-[280px] text-lg border-r border-gray-700 max-w-[700px]">
        <div className={`flex justify-between bg-black border-b border-gray-700 p-3 sticky top-0 ${!isOpen && 'z-50'}`}>
          <h2 className="font-bold">Home</h2>
          <SparklesIcon className="h-5 w-5" />
        </div>

        <div className="hidden lg:block">
          <Input />
        </div>
        {tweets.map((tweet) => <Tweet key={tweet.id} id={tweet.id} tweetID={tweet.id} tweet={tweet.data()} />)}

      </div>
    )
  )
}

export default Feed
