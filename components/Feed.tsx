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
import Spinner from './Spinner';
import { sortByNewest, sortByOldest } from '../utils/sortTweets'
import { SortDropdown } from './SortDropdown';
import { useRouter } from 'next/router';

const Feed = () => {

  const { data: session } = useSession()
  const [tweets, setTweets] = useState([])
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [loading, setLoading] = useState(true)
  const [sortType, setSortType] = useState('Oldest')

  const router = useRouter()

  useEffect(() => onSnapshot(
    query(collection(db, "tweets"), orderBy("timestamp", "desc")),
    (snapshot) => {
      setTweets(snapshot.docs)
      setLoading(false)
    }
  ), [db, router.query])

  useEffect(() => {
    setTweets(getSortedTweets())
    setLoading(false)
  }, [sortType])

  const getSortedTweets = () => {
    switch (sortType) {
      case 'Newest':
        return sortByNewest(tweets)
      case 'Oldest':
        return sortByOldest(tweets)
      default:
        return sortByNewest(tweets)
    }
  }

  return (
    loading ? <div className="sm:ml-[80px] xl:ml-[280px] w-[700px] 2xl:w-[800px] pt-4">
      <Spinner />
    </div> : (
      <div className="flex-grow sm:ml-[80px] xl:ml-[280px] w-text-lg border-r border-gray-700 max-w-[700px] 2xl:max-w-[800px]">
        <div className={`flex justify-between items-center bg-black border-b border-gray-700 p-3 sticky top-0 ${!isOpen && 'z-50'}`}>
          <h2 className="font-bold">Home</h2>
          <SparklesIcon className="h-5 w-5" />
        </div>

        <div className="hidden lg:block">
          <Input />
        </div>

        <div>
          <SortDropdown sortType={sortType} setSortType={setSortType} />
        </div>
        {tweets.map((tweet) => {
          return (
            <Tweet key={tweet.id} id={tweet.id} tweetID={tweet.id} tweet={tweet.data()} />
          )
        })}

      </div>
    )
  )
}

export default Feed
