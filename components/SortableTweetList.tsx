import React, { useState, useMemo, useEffect } from 'react';
import { sortByNewest, sortByOldest, sortByMostLikes, sortByMostReplies, sortByMostBookmarks, sortByMostRetweets } from '../utils/sortTweets';
import { SortDropdown } from './SortDropdown';
import InfiniteScroll from './InfiniteScroll';
import Tweet from './Tweet/Tweet';
import TweetSkeletonLoader from './TweetSkeletonLoader';

interface SortableTweetListProps {
  tweets: any[];
  id?: string;
  loading?: boolean;
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
  emptyStateIcon?: React.ComponentType<any>;
  customRenderItem?: (tweet: any) => React.ReactNode;
  itemsPerPage?: number;
  className?: string;
}

/**
 * @description - A reusable component that displays a sortable list of tweets
 * with all the sorting options from the main feed
 */
const SortableTweetList = ({
  tweets,
  id,
  loading = false,
  emptyStateMessage = 'No Tweets',
  emptyStateSubtitle = 'When you post, they\'ll show up here.',
  emptyStateIcon: EmptyIcon,
  customRenderItem,
  itemsPerPage = 10,
  className = ''
}: SortableTweetListProps) => {
  const [sortType, setSortType] = useState('Newest');
  const [filteredTweets, setFilteredTweets] = useState([]);

  /**
   * @description - Get sorted tweets based on the selected sort type
   */
  const getSortedTweets = (tweetsToSort: any[]) => {
    switch (sortType) {
      case 'Newest':
        return sortByNewest(tweetsToSort);
      case 'Oldest':
        return sortByOldest(tweetsToSort);
      case 'Most Likes':
        return sortByMostLikes(tweetsToSort);
      case 'Most Replies':
        return sortByMostReplies(tweetsToSort);
      case 'Most Bookmarks':
        return sortByMostBookmarks(tweetsToSort);
      case 'Most Retweets':
        return sortByMostRetweets(tweetsToSort);
      default:
        return sortByNewest(tweetsToSort);
    }
  };

  /**
   * @description - Memoized sorted tweets - recalculates when:
   * - tweets.length changes (new tweet added/removed)
   * - sortType changes (user changes sort order)
   * - id changes (navigating to different tweet page)
   * - first tweet's parentTweet changes (new tweet data loaded)
   *
   * This ensures we recalculate when navigating between pages even if tweet count is the same
   */
  const sortedTweetIds = useMemo(() => {
    // If no id is provided, just sort normally (used for feed/profile pages)
    if (!id) {
      const sorted = getSortedTweets(tweets);
      return sorted.map(tweet => tweet.uniqueId || tweet.id);
    }

    // If id is provided but no tweets yet, return empty (waiting for data to load)
    if (tweets.length === 0) {
      return [];
    }

    // Check if the first tweet's parentTweet matches the current id
    const firstTweetData = tweets[0]?.data ? tweets[0].data() : tweets[0];
    const firstTweetParent = firstTweetData?.parentTweet;

    // Only sort if tweets belong to the current parent
    if (firstTweetParent === id) {
      const sorted = getSortedTweets(tweets);
      return sorted.map(tweet => tweet.uniqueId || tweet.id);
    }

    // If parentTweet doesn't match, these are stale tweets from previous page
    return [];
  }, [tweets.length, sortType, id, tweets[0]?.data ? tweets[0].data()?.parentTweet : tweets[0]?.parentTweet]);

  /**
   * @description - Get current tweet data in sorted order using stable IDs
   */
  const optimizedSortedTweets = useMemo(() => {
    const tweetMap = new Map(tweets.map(tweet => [tweet.uniqueId || tweet.id, tweet]));
    return sortedTweetIds.map(id => tweetMap.get(id)).filter(Boolean);
  }, [tweets, sortedTweetIds]);

  // Update state when optimized tweets change
  useEffect(() => {
    setFilteredTweets(optimizedSortedTweets);
  }, [optimizedSortedTweets]);

  /**
   * @description - Default render function for tweets
   */
  const defaultRenderItem = (tweet: any) => (
    <Tweet
      key={tweet.id}
      id={tweet.id}
      tweetID={tweet.id}
      tweet={{
        ...tweet.data(),
        tweetId: tweet.id
      }}
    />
  );

  const renderItem = customRenderItem || defaultRenderItem;

  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: itemsPerPage }, (_, index) => (
          <TweetSkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Sort dropdown */}
      <div className="mb-4">
        <SortDropdown sortType={sortType} setSortType={setSortType} />
      </div>

      {/* Tweet list or empty state */}
      {filteredTweets.length > 0 ? (
        <InfiniteScroll
          items={filteredTweets}
          renderItem={renderItem}
          itemsPerPage={itemsPerPage}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-900 dark:text-gray-500">
          {EmptyIcon && <EmptyIcon className="h-12 w-12 mb-4" />}
          <p className="text-xl font-semibold px-2">{emptyStateMessage}</p>
          <p className="text-gray-700 dark:text-gray-400 mt-2 px-4">{emptyStateSubtitle}</p>
        </div>
      )}

      <div className="h-[60px]" />
    </div>
  );
};

export default SortableTweetList;