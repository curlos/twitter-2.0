import { SearchIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import SmallEvent from './SmallEvent';
import SmallUser from './SmallUser';
import { getRecent } from '../services/videoGameNews.service';

/**
 * @description - This is the RIGHT sidebar displayed on DESKTOP (or a screen big enough to hold it). This will show recommended users to follow as well as the trending events of the day. Those trending events are currently set as only video games but may change in the future.
 * @returns {React.FC}
 */
const Widgets = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [latestNews, setLatestNews] = useState([]);
  const [numNewsShown, setNumNewsShown] = useState(4);

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

  // Make the call to get the latest news once. Currently this is ONLY video game news.
  useEffect(() => {
    getLatestNews();
  }, []);

  /**
   * @description - Get the latest news to display on the "What's happening" section.
   */
  const getLatestNews = async () => {
    try {
      const latestNewsInCache = sessionStorage.getItem('latestNews');

      // To reduce API calls (since their is a rate limit on this API), we will get the news from the sessionStorage if it's there.
      if (latestNewsInCache) {
        setLatestNews(JSON.parse(latestNewsInCache));
      } else {
        // Get's the latest news and sets it.
        const data = await getRecent();
        setLatestNews(data);
        // Set the news in the cache for later retrieval if need be.
        sessionStorage.setItem('latestNews', JSON.stringify(data));
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

      {/* Displays the recommended users to follow. */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4 w-[350[x]">
        <h2 className="text-xl font-bold mb-4 p-3">Who to follow</h2>

        <SmallUser />
        <SmallUser />
        <SmallUser />
        <div className="p-1 w-full" />
      </div>

      {/* Displays the current, trending events of the day. Right now, will display ONLY video game news. */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-3 w-[350px]">
        <h2 className="text-xl font-bold mb-4 px-3">What's happening</h2>

        {latestNews && latestNews.length > 0 && latestNews.slice(0, numNewsShown).map((news) => (
          <SmallEvent news={news} />
        ))}

        {/* ONLY 4 events will initially be shown but if the user clicks "Show more", then 4 more events will be added (for example, since they start off with 4 events, if they click "Show more" once, then 4 more events will be added so NOW they will see 8 events in total.)  */}
        {numNewsShown <= latestNews.length && (
          <div>
            <button className="cursor-pointer text-lightblue-400 hover:underline px-3 pt-3" onClick={() => setNumNewsShown(numNewsShown + 4)}>Show more</button>
          </div>
        )}
      </div>
    </div >
  );
};

export default Widgets;
