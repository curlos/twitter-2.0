import React, { useEffect, useState } from 'react'
import { sortByNewest, sortByOldest } from '../utils/sortTweets'
import Tweet from './Tweet'

interface Props {
  author: any,
  tweets: any,
  retweets: any,
  likes: any,
  filter?: string
}

const getSortedTweets = (tweets) => {
  return sortByNewest(tweets)
}

const Tweets = ({ author, tweets, retweets, likes, filter }: Props) => {
  const [allTweets, setAllTweets] = useState(getSortedTweets([...tweets, ...retweets]))
  const [filteredTweets, setFilteredTweets] = useState([])

  useEffect(() => {
    getFilteredTweets().then((data) => {
      setFilteredTweets(data)
    })
  }, [filter])

  const getFilteredTweets = async () => {
    switch (filter) {
      case 'Tweets':
        return allTweets.filter((tweet) => {
          if (!tweet.data().parentTweet) {
            return tweet
          }
        })
      case 'Tweets & Replies':
        return allTweets
      case 'Media':
        return allTweets.filter((tweet) => {
          if (tweet.data().image) {
            return tweet
          }
        })
      case 'Likes':
        return sortByNewest(likes)
    }
  }

  return (
    <div>
      {filteredTweets.map((tweet) => {
        const tweetData = tweet.data()

        return (
          <Tweet id={tweet.id} tweet={tweetData} tweetID={tweet.id} />
        )
      })}
    </div>
  )
}

export default Tweets
