import { SearchIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import SmallEvent from './SmallEvent';
import { getLatestNews } from '../services/news.service';
import { useDebounceSearch } from '../hooks/useDebounceSearch';
import { latestNewsFromLateSeptember2025 } from '../latestNewsFromLateSeptember2025';

/**
 * @description - This is the RIGHT sidebar displayed on DESKTOP (or a screen big enough to hold it). This will show recommended users to follow as well as the trending events of the day. Those trending events are currently set as only video games but may change in the future.
 * @returns {React.FC}
 */
const Widgets = () => {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useDebounceSearch();
  const [latestNews, setLatestNews] = useState([]);


  // Make the call to get the latest news once.
  useEffect(() => {
    getData();
  }, []);

  /**
   * @description - Get the latest news to display on the "What's happening" section.
   */
  const getData = async () => {
    try {
      const latestNewsInCache = sessionStorage.getItem('latestNews');
      let newsData = [];

      // To reduce API calls (since their is a rate limit on this API), we will get the news from the sessionStorage if it's there.
      if (latestNewsInCache) {
        newsData = JSON.parse(latestNewsInCache);
      } else {
        // Get's the latest news and sets it.
        const data = await getLatestNews();
        newsData = data?.results || [];
        // Set the latest news in the cache for later retrieval if need be.
        sessionStorage.setItem('latestNews', JSON.stringify(newsData));
      }

      // Use fallback data if newsData is empty
      if (newsData.length === 0) {
        newsData = latestNewsFromLateSeptember2025;
      }

      const sortedNews = newsData.sort((a, b) => a.source_priority - b.source_priority);
      setLatestNews(sortedNews);
    } catch (error) {
      console.error(error);
      // Use fallback data when error occurs
      const sortedFallbackNews = latestNewsFromLateSeptember2025.sort((a, b) => a.source_priority - b.source_priority);
      setLatestNews(sortedFallbackNews);
    }
  };

  return (
    <div className="hidden px-3 py-2 space-y-5 lg:block">
      {/* User can type in something to search for a specific tweet on the site. */}
      <div className="flex items-center w-[350px]">
        <div className="text-gray-500 bg-gray-200 dark:bg-gray-800 p-3 rounded-l-full">
          <SearchIcon className="h-6 w-6" />
        </div>
        <input placeholder="Search Twitter 2.0" value={searchQuery} className="bg-gray-200 dark:bg-gray-800 rounded-r-full p-3 w-[300px] focus:outline-none" onChange={(e) => setSearchQuery(e.target.value)}></input>
      </div>

      {/* Displays the current, trending events of the day. Right now, will display ONLY video game news. */}
      {router.pathname !== '/news' && (
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg py-3 w-[350px]">
          <h2 className="text-xl font-bold mb-4 px-3">What's happening</h2>

          {latestNews && latestNews.length > 0 && latestNews.slice(0, 5).map((news) => (
            <SmallEvent key={news.link} news={news} />
          ))}

          <button
            className="cursor-pointer text-lightblue-400 hover:underline px-3 pt-3"
            onClick={() => router.push('/news')}
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default Widgets;
