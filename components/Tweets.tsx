import React, { useState } from 'react'
import { sortByNewest, sortByOldest } from '../utils/sortTweets'
import Tweet from './Tweet'

interface Props {
  author: any,
  tweets: any,
  retweets: any
}

const getSortedTweets = (tweets) => {
  console.log(tweets)
  return sortByNewest(tweets)
}

const Tweets = ({ author, tweets, retweets }: Props) => {
  const [allTweets, setAllTweets] = useState(getSortedTweets([...tweets, ...retweets]))

  return (
    <div>
      {allTweets.map((tweet) => {
        const tweetData = tweet.data()

        return (
          <Tweet id={tweet.id} tweet={tweetData} />
        )
      })}
    </div>
  )
}

export default Tweets
