import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import AppLayout from '../components/Layout/AppLayout';
import { getLatestNews } from '../services/news.service';
import { latestNewsFromLateSeptember2025 } from '../latestNewsFromLateSeptember2025';

interface NewsItem {
  article_id: string;
  title: string;
  link: string;
  creator: string[] | null;
  description: string;
  pubDate: string;
  image_url: string | null;
  source_name: string;
  source_icon: string | null;
  source_priority: number;
  content: string;
}

const News: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestNews();
  }, [session, router]);

  const fetchLatestNews = async () => {
    try {
      const cachedLatestNews = sessionStorage.getItem('latestNews');
      let newsData: NewsItem[] = [];

      if (cachedLatestNews) {
        newsData = JSON.parse(cachedLatestNews);
      } else {
        const data = await getLatestNews();
        newsData = data?.results || [];
        sessionStorage.setItem('latestNews', JSON.stringify(newsData));
      }

      // Use fallback data if newsData is empty or there's an error
      if (newsData.length === 0) {
        newsData = latestNewsFromLateSeptember2025;
      }

      const sortedNews = newsData.sort((a, b) => a.source_priority - b.source_priority);
      setLatestNews(sortedNews);
    } catch (error) {
      console.error('Error fetching latest news:', error);
      // Use fallback data when error occurs
      const sortedFallbackNews = latestNewsFromLateSeptember2025.sort((a, b) => a.source_priority - b.source_priority);
      setLatestNews(sortedFallbackNews);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout title="News - Twitter 2.0">
      <main className="flex-1 min-h-screen border-l border-r border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Latest News</h1>
              <p className="text-sm text-gray-500">Latest news from the US</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pb-20">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lightblue-500"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {latestNews.map((article, index) => (
                <article
                  key={article.link || index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => window.open(article.link, '_blank', 'noopener,noreferrer')}
                >
                  <div className="md:flex md:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 md:mb-0 mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-400 flex items-center gap-1">
                            {article.source_icon && (
                              <img
                                src={article.source_icon}
                                alt=""
                                className="w-5 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            {article.source_name}
                          </span>
                          <span className="text-sm text-gray-500 hidden md:inline">•</span>
                          <span className="text-sm text-gray-500 hidden md:inline">
                            {formatDate(article.pubDate)}
                          </span>
                        </div>
                        <div className="md:hidden">
                          <span className="text-sm text-gray-500">
                            {formatDate(article.pubDate)}
                          </span>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold mb-2 md:line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Mobile image placement - after headline */}
                      {article.image_url && (
                        <div className="md:hidden mb-3">
                          <img
                            src={article.image_url}
                            alt=""
                            className="w-full object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {article.description && (
                        <p className="text-gray-700 dark:text-gray-400 md:line-clamp-3 mb-3">
                          {article.description}
                        </p>
                      )}
                      {article.creator && article.creator.length > 0 && (
                        <p className="text-sm text-gray-500 mb-2">
                          By {article.creator[0]}
                        </p>
                      )}
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-lightblue-500 hover:text-lightblue-600 text-sm font-medium"
                      >
                        Read full article
                        <ExternalLinkIcon className="ml-1 w-4 h-4" />
                      </a>
                    </div>

                    {/* Desktop image placement - on the right */}
                    {article.image_url && (
                      <div className="hidden md:block md:flex-shrink-0">
                        <img
                          src={article.image_url}
                          alt=""
                          className="max-w-48 object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default News;