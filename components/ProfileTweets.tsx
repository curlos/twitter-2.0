import React, { useEffect, useState } from 'react';
import { sortByNewest } from '../utils/sortTweets';
import { IAuthor } from '../utils/types';
import Tweet from './Tweet';
import { ChatAltIcon } from '@heroicons/react/outline';

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

  const allTweets = getSortedTweets(tweets, retweets);

  const getFilteredTweets = () => {
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
      default:
        return allTweets;
    }
  };

  const filteredTweets = getFilteredTweets();

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'Tweets':
        return 'No Tweets';
      case 'Tweets & Replies':
        return 'No Tweets & Replies';
      case 'Media':
        return 'No Media';
      case 'Likes':
        return 'No Likes';
      default:
        return 'No Tweets';
    }
  };

  return (
    <div>
      {filteredTweets.length > 0 ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <ChatAltIcon className="h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">{getEmptyStateMessage()}</p>
          <p className="text-gray-400 mt-2">When you post, they'll show up here.</p>
        </div>
      )}
      <div className="h-[60px]" />
    </div>
  );
};

export default ProfileTweets;
