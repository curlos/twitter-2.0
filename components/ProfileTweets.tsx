import React, { useEffect, useState } from 'react';
import { sortByNewest } from '../utils/sortTweets';
import { IAuthor } from '../utils/types';
import Tweet from './Tweet';

interface Props {
  author: IAuthor,
  tweets: any[],
  retweets: any[],
  likes: any,
  filter?: string;
}

/**
 * 
 * @param {Array<ITweet>} tweets - List of tweets.
 * @returns {Array<ITweet>}
 */
const getSortedTweets = (originalTweets, userRetweets) => {
  // Add retweet flags without destroying Firebase document structure
  const markedOriginalTweets = originalTweets.map(tweet => {
    tweet.isRetweet = false;
    return tweet;
  });

  const markedRetweets = userRetweets.map(tweet => {
    tweet.isRetweet = true;
    return tweet;
  });

  // Combine and sort using the original sortByNewest function
  return sortByNewest([...markedOriginalTweets, ...markedRetweets]);
};

/**
 * @description - Render a list of tweets in the user's profile page.
 * @returns {React.FC}
 */
const ProfileTweets = ({ tweets, retweets, likes, filter }: Props) => {

  const [allTweets, _setAllTweets] = useState(getSortedTweets(tweets, retweets));
  const [filteredTweets, setFilteredTweets] = useState([]);

  useEffect(() => {
    // Each time the filter changes, all the tweets will be passed through the filter again.
    getFilteredTweets().then((data) => {
      setFilteredTweets(data);
    });
  }, [filter]);

  /**
   * @description - Using the user selected filter (or the default of 'Tweets'), filter all the tweets in the list by the filter.
   * @returns {Array<ITweet>}
   */
  const getFilteredTweets = async () => {
    switch (filter) {
      case 'Tweets':
        return allTweets.filter((tweet) => {
          if (!tweet.data().parentTweet) {
            return tweet;
          }
        });
      case 'Tweets & Replies':
        return allTweets;
      case 'Media':
        return allTweets.filter((tweet) => {
          if (tweet.data().image) {
            return tweet;
          }
        });
      case 'Likes':
        return sortByNewest(likes);
    }
  };

  console.log(filteredTweets)

  return (
    <div>
      {/* Render the list of filtered tweets. */}
      {filteredTweets.map((tweet) => {
        const tweetData = tweet.data();
        // Create unique key that includes retweet status to avoid duplicate key warnings
        const uniqueKey = `${tweet.id}-${tweet.isRetweet ? 'retweet' : 'original'}`;

        return (
          <Tweet
            key={uniqueKey}
            id={tweet.id}
            tweet={{
              ...tweetData,
              tweetId: tweet.id
            }}
            tweetID={tweet.id}
          />
        );
      })}
      <div className="h-[60px]" />
    </div>
  );
};

export default ProfileTweets;
