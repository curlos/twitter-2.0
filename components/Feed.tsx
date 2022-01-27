import React, { useCallback, useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/outline'
import { db } from "../firebase";
import Input from './Input'
import { useSession } from 'next-auth/react';
import { onSnapshot, query } from '@firebase/firestore';
import { collection, orderBy } from 'firebase/firestore';
import Tweet from './Tweet';
import Widgets from './Widgets';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState } from '../atoms/atom';
import { FaFeatherAlt } from 'react-icons/fa';
import Spinner from './Spinner';
import { sortByNewest, sortByOldest } from '../utils/sortTweets'
import { SortDropdown } from './SortDropdown';
import { useRouter } from 'next/router';
import { debounce } from 'lodash'
import AuthReminder from './AuthReminder';

const Feed = () => {

  const { data: session } = useSession()
  const [tweets, setTweets] = useState([])
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [loading, setLoading] = useState(true)
  const [sortType, setSortType] = useState('Newest')
  const [filteredTweets, setFilteredTweets] = useState([])

  const router = useRouter()

  useEffect(() => onSnapshot(
    query(collection(db, "tweets"), orderBy("timestamp", "desc")),
    (snapshot) => {
      console.log(router.query.query)
      setTweets(snapshot.docs)
      setFilteredTweets(getFilteredTweets(router.query.query, snapshot.docs))
      setLoading(false)
    }
  ), [db])

  useEffect(() => {
    setLoading(true)
    const filteredTweets = getFilteredTweets(router.query.query, tweets)
    setFilteredTweets(getSortedTweets(filteredTweets))
    setLoading(false)
  }, [sortType, router.query.query])

  const getFilteredTweets = (searchQuery, tweets) => {
    console.log(searchQuery)
    if (searchQuery === '' || !searchQuery || !tweets) {
      return tweets
    } else {
      const filteredTweets = tweets.filter((tweet) => {
        console.log(searchQuery)
        if (searchQuery && typeof searchQuery === 'string') {
          return tweet.data().text.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return tweet
      })
      return filteredTweets
    }
  }

  const getSortedTweets = (tweets) => {
    switch (sortType) {
      case 'Newest':
        return sortByNewest(tweets)
      case 'Oldest':
        return sortByOldest(tweets)
      default:
        return sortByNewest(tweets)
    }
  }

  console.log(filteredTweets)
  console.log(router.query)

  return (
    loading ? <div className="sm:ml-[80px] xl:ml-[280px] w-[700px] 2xl:w-[800px] pt-4">
      <Spinner />
    </div> : (
      <div className={`${theme} flex-grow sm:ml-[80px] xl:ml-[280px] w-text-lg border-r border-[#AAB8C2] dark:border-gray-700`}>
        <div className={`bg-white dark:bg-black border-b border-[#AAB8C2]  dark:border-gray-700 p-3 sticky top-0 ${!isOpen && 'z-50'}`}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Home</h2>
            <SparklesIcon className="h-5 w-5" />
          </div>

          <AuthReminder />
        </div>

        {session && session.user && (
          <div className="hidden lg:block">
            <Input />
          </div>
        )}

        <div>
          <SortDropdown sortType={sortType} setSortType={setSortType} />
        </div>
        {!loading ? filteredTweets.map((tweet) => {
          return (
            <Tweet key={tweet.id} id={tweet.id} tweetID={tweet.id} tweet={tweet.data()} />
          )
        }) : (
          <Spinner />
        )}

      </div>
    )
  )
}

export default Feed
