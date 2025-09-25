import React, { useEffect, useState, useMemo } from 'react';
import { SparklesIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import { db } from "../firebase";
import Input from './Input';
import { useSession } from 'next-auth/react';
import { onSnapshot, query, collection, orderBy } from '@firebase/firestore';
import { useRecoilState } from 'recoil';
import { colorThemeState } from '../atoms/atom';
import { useRouter } from 'next/router';
import AuthReminder from './AuthReminder';
import SortableTweetList from './SortableTweetList';

/**
 * @description - List of tweets to be shown on the user's "feed" page (first page they arrive on essentially)
 * @returns {React.FC}
 */
const Feed = () => {

  const { data: session } = useSession();
  const [tweets, setTweets] = useState([]);
  const [theme] = useRecoilState(colorThemeState);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /**
   * @description - Gets the initial list of tweets once and also sets the base tweets AND the filtered tweets from those base tweets.
   */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      // Go to the database and get the collection called "tweets" and order that list by decsending timestamp (meaning they would sorted by newest to oldest.)
      query(collection(db, "tweets"), orderBy("timestamp", "desc")),
      (snapshot) => {
        // Using all the tweets we get back set them into the "tweets" state so we can keep track of them all.
        setTweets(snapshot.docs);
        // Now that the API call to the database is done, loading is finished.
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  /**
   * @description - Filter tweets by search query
   */
  const getFilteredTweets = (searchQuery, tweets) => {
    if (searchQuery === '' || !searchQuery || !tweets) {
      return tweets;
    } else {
      return tweets.filter((tweet) => {
        if (searchQuery && typeof searchQuery === 'string') {
          return tweet.data().text.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return tweet;
      });
    }
  };

  // Get filtered tweets based on search query
  const filteredTweets = useMemo(() => {
    return getFilteredTweets(router.query.query, tweets);
  }, [router.query.query, tweets]);

  return (
    
    <div className={`${theme} flex-grow w-text-lg border-r border-[#AAB8C2] dark:border-gray-700`}>
      <div className={`bg-white dark:bg-black border-b border-[#AAB8C2]  dark:border-gray-700 p-3 sticky top-0 z-40`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-bold">{router.query.query ? `Search results for: ${router.query.query}` : 'Home'}</h2>
            {router.query.query && (
              <button
                onClick={() => router.push('/')}
                className="p-1 rounded-full hover:bg-lightblue-100 dark:hover:bg-lightblue-900 transition-colors"
              >
                <XIcon className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          <SparklesIcon className="h-5 w-5" />
        </div>

        <AuthReminder />
      </div>

      {/* If the user is logged in, then show the input so that they can tweet something out if they so wish. */}
      {session && session.user && !router.query.query && (
        <div className="hidden md:block">
          <Input />
        </div>
      )}

      {/* Sortable tweet list with all sorting functionality */}
      <SortableTweetList
        tweets={filteredTweets}
        loading={loading}
        emptyStateMessage="No tweets yet"
        emptyStateSubtitle="When people post tweets, they'll show up here."
        itemsPerPage={10}
      />
    </div>
  );
};

export default Feed;
