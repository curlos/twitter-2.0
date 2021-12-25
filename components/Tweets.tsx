import React from 'react'
import Tweet from './Tweet'

interface Props {
  author: any,
  tweets: any,
  retweets: any
}

const Tweets = ({ author, tweets, retweets }: Props) => {
  const allTweets = [...tweets, ...retweets]

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
