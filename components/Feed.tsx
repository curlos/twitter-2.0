import React, { useEffect, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/outline';
import { db } from "../firebase";
import Input from './Input';
import { useSession } from 'next-auth/react';
import { onSnapshot, query, collection, orderBy } from '@firebase/firestore';
import Tweet from './Tweet';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState } from '../atoms/atom';
import Spinner from './Spinner';
import { sortByNewest, sortByOldest } from '../utils/sortTweets';
import { SortDropdown } from './SortDropdown';
import { useRouter } from 'next/router';
import AuthReminder from './AuthReminder';

/**
 * @description - List of tweets to be shown on the user's "feed" page (first page they arrive on essentially)
 * @returns {React.FC}
 */
const Feed = () => {

  const { data: session } = useSession();
  const [tweets, setTweets] = useState([]);
  const [isOpen] = useRecoilState(newTweetModalState);
  const [theme] = useRecoilState(colorThemeState);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('Newest');
  const [filteredTweets, setFilteredTweets] = useState([]);

  const router = useRouter();

  /**
   * @description - Gets the initial list of tweets once and also sets the base tweets AND the filtered tweets from those base tweets.
   */
  useEffect(() => onSnapshot(
    // Go to the database and get the collection called "tweets" and order that list by decsending timestamp (meaning they would sorted by newest to oldest.)
    query(collection(db, "tweets"), orderBy("timestamp", "desc")),
    (snapshot) => {
      // Using all the tweets we get back set them into the "tweets" state so we can keep track of them all.
      setTweets(snapshot.docs);
      // Using all the tweets from this query, we want to filter by certain parameters if they exist
      setFilteredTweets(getFilteredTweets(router.query.query, snapshot.docs));
      // Now that the API call to the database is done, loading is finished.
      setLoading(false);
    }
  ), []);

  /**
   * @description - Get the filtered tweets according to the most up to date filters set by a user (either through searching for specific tweets OR sorting them (newest or oldest))
   */
  useEffect(() => {
    setLoading(true);
    const filteredTweets = getFilteredTweets(router.query.query, tweets);
    setFilteredTweets(getSortedTweets(filteredTweets));
    setLoading(false);

    /**
     * This will run anytime the "sortType" or "router.query.query" values change.
     * "sortType" - This will change whenever the user clicks a new sort type through the dropdown at the top of the feed.
     * "router.query.query" - This will change whenever the user types and submits something through the "Search" feature which shows a modal where they would type in.
     */
  }, [sortType, router.query.query]);

  /**
   * 
   * @param {String} searchQuery - The string we get from the URL a query string (the query key is "query", so for example if the user wanted to filter by only tweets containing the word "NBA", then the query would look like this: "/?query=NBA")
   * @param {Array<QueryDocumentSnapshot<T>>} tweets - The list of tweets we get back with the specific query parameters.
   * @returns 
   */
  const getFilteredTweets = (searchQuery, tweets) => {
    if (searchQuery === '' || !searchQuery || !tweets) {
      return tweets;
    } else {
      const filteredTweets = tweets.filter((tweet) => {
        if (searchQuery && typeof searchQuery === 'string') {
          return tweet.data().text.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return tweet;
      });
      return filteredTweets;
    }
  };

  /**
   * @description - Get the sorted tweets either by oldest or newest.
   * @param {Array<QueryDocumentSnapshot<T>>} tweets - The list of tweets we get back with the specific query parameters.
   * @returns {Array<QueryDocumentSnapshot<T>>} - The list of SORTED tweets (either by newest or oldest).
   */
  const getSortedTweets = (tweets) => {
    switch (sortType) {
      case 'Newest':
        return sortByNewest(tweets);
      case 'Oldest':
        return sortByOldest(tweets);
      default:
        return sortByNewest(tweets);
    }
  };

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

        {/* If the user is logged in, then show the input so that they can tweet something out if they so wish. */}
        {session && session.user && (
          <div className="hidden md:block">
            <Input />
          </div>
        )}

        {/* Show the sort dropdown which will change the "sortType" when one of the options are selected. */}
        <div>
          <SortDropdown sortType={sortType} setSortType={setSortType} />
        </div>

        {/* When everything is done loading, show the filtered tweets. NOTE: If there is NO filter applied, then ALL of the tweets will be shown (as it's done by default). */}
        {!loading ? filteredTweets.map((tweet) => {
          return (
            <Tweet key={tweet.id} id={tweet.id} tweetID={tweet.id} tweet={{
              ...tweet.data(),
              tweetId: tweet.id
            }} />
          );
        }) : (
          // If stuff is still loading, then show the spinner.
          <Spinner />
        )}

        <div className="h-[60px]" />

      </div>
    )
  );
};

export default Feed;
