import React, { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/outline'
import { db } from "../firebase";
import Input from './Input'
import { useSession } from 'next-auth/react';
import { onSnapshot, query } from '@firebase/firestore';
import { collection, orderBy } from 'firebase/firestore';
import Tweet from './Tweet';

const Feed = () => {

  const { data: session } = useSession()
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => onSnapshot(
    query(collection(db, "tweets"), orderBy("timestamp", "desc")),
    (snapshot) => {
      setTweets(snapshot.docs)
      setLoading(false)
    }
  ), [db])

  console.log(tweets)

  return (
    loading ? <div>Loading...</div> : (
      <div className="flex-grow lg:ml-[280px] text-lg border-r border-gray-500">
        <div className="flex justify-between border-b border-gray-500 p-3">
          <h2 className="font-bold">Home</h2>
          <SparklesIcon className="h-5 w-5" />
        </div>

        <Input />
        {tweets.map((tweet) => <Tweet key={tweet.id} id={tweet.id} tweet={tweet.data()} />)}

      </div>
    )
  )
}

export default Feed
