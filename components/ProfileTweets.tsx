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
const getSortedTweets = (tweets) => {
  return sortByNewest(tweets);
};

/**
 * @description - Render a list of tweets in the user's profile page.
 * @returns {React.FC}
 */
const ProfileTweets = ({ tweets, retweets, likes, filter }: Props) => {

  const [allTweets, _setAllTweets] = useState(getSortedTweets([...tweets, ...retweets]));
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

  return (
    <div>
      {/* Render the list of filtered tweets. */}
      {filteredTweets.map((tweet) => {
        const tweetData = tweet.data();

        return (
          <Tweet key={tweet.id} id={tweet.id} tweet={{
            ...tweetData,
            tweetId: tweet.id
          }} tweetID={tweet.id} />
        );
      })}
      <div className="h-[60px]" />
    </div>
  );
};

export default ProfileTweets;
