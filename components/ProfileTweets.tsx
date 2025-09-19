import React, { useMemo } from 'react';
import { sortByNewest } from '../utils/sortTweets';
import { IAuthor } from '../utils/types';
import { ChatAltIcon } from '@heroicons/react/outline';
import SortableTweetList from './SortableTweetList';
import Tweet from './Tweet/Tweet';

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

  const filteredTweets = useMemo(() => {
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
          const tweetData = tweet.data();
          if (tweetData.image || (tweetData.images && tweetData.images.length > 0)) {
            return tweet;
          }
        });
      case 'Likes':
        return sortByNewest(likes);
      default:
        return allTweets;
    }
  }, [allTweets, likes, filter]);

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

  // Custom render function to handle retweet keys
  const customRenderItem = (tweet: any) => {
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
  };

  return (
    <SortableTweetList
      tweets={filteredTweets}
      emptyStateMessage={getEmptyStateMessage()}
      emptyStateSubtitle="When you post, they'll show up here."
      emptyStateIcon={ChatAltIcon}
      customRenderItem={customRenderItem}
      itemsPerPage={10}
    />
  );
};

export default ProfileTweets;
