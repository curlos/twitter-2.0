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

const getSortedTweets = (tweets) => {
  return sortByNewest(tweets);
};

/**
 * @description - 
 * @returns {React.FC}
 */
const Tweets = ({ tweets, retweets, likes, filter }: Props) => {

  const [allTweets, _setAllTweets] = useState(getSortedTweets([...tweets, ...retweets]));
  const [filteredTweets, setFilteredTweets] = useState([]);

  useEffect(() => {
    getFilteredTweets().then((data) => {
      setFilteredTweets(data);
    });
  }, [filter]);

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

export default Tweets;
