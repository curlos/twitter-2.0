import { SearchIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import SmallEvent from './SmallEvent';
import SmallUser from './SmallUser';
import { getTopHeadlines } from '../services/news.service';

/**
 * @description - This is the RIGHT sidebar displayed on DESKTOP (or a screen big enough to hold it). This will show recommended users to follow as well as the trending events of the day. Those trending events are currently set as only video games but may change in the future.
 * @returns {React.FC}
 */
const Widgets = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [topHeadlines, setTopHeadlines] = useState([]);

  /**
   * @description - Handles the "Search" form's submission. When submitted, this will redirect the user to a list of tweets on their feed filtered by whatever query they typed in.
   * @param e 
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/?query=${searchQuery}`);
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    // If there's a search query already in the URL, then change the value of the "searchQuery" input to match that so the user knows that they've already filtered the tweets they're seeing by a certain value.
    if (router.query && router.query.query && typeof (router.query.query) === 'string') {
      setSearchQuery(router.query.query);
    }
  }, [router.query.query]);

  // Make the call to get the top headlines once.
  useEffect(() => {
    getData();
  }, []);

  /**
   * @description - Get the top headlines to display on the "What's happening" section.
   */
  const getData = async () => {
    try {
      const topHeadlinesInCache = sessionStorage.getItem('topHeadlines');

      // To reduce API calls (since their is a rate limit on this API), we will get the headlines from the sessionStorage if it's there.
      if (topHeadlinesInCache) {
        setTopHeadlines(JSON.parse(topHeadlinesInCache));
      } else {
        // Get's the top headlines and sets it.
        const data = await getTopHeadlines();
        setTopHeadlines(data?.articles || []);
        // Set the headlines in the cache for later retrieval if need be.
        sessionStorage.setItem('topHeadlines', JSON.stringify(data?.articles || []));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="hidden pl-3 py-2 space-y-5 2xl:block">
      {/* User can type in something to search for a specific tweet on the site. */}
      <form onSubmit={handleSubmit} className="flex items-center w-[350px]">
        <div className="text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded-l-full cursor-pointer">
          <SearchIcon onClick={handleSubmit} className="h-6 w-6" />
        </div>
        <input placeholder="Search Twitter 2.0" value={searchQuery} className="bg-gray-100 dark:bg-gray-800 rounded-r-full p-3 w-[300px] focus:outline-none" onChange={(e) => setSearchQuery(e.target.value)}></input>
      </form>

      {/* Displays the current, trending events of the day. Right now, will display ONLY video game news. */}
      {router.pathname !== '/headlines' && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-3 w-[350px]">
          <h2 className="text-xl font-bold mb-4 px-3">What's happening</h2>

          {topHeadlines && topHeadlines.length > 0 && topHeadlines.slice(0, 5).map((news) => (
            <SmallEvent key={news.url} news={news} />
          ))}

          <button
            className="cursor-pointer text-lightblue-400 hover:underline px-3 pt-3"
            onClick={() => router.push('/headlines')}
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default Widgets;
