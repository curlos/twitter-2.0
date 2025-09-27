import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import AppLayout from '../components/Layout/AppLayout';
import { getTopHeadlines } from '../services/news.service';

interface NewsItem {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

const Headlines: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeadlines();
  }, [session, router]);

  const fetchHeadlines = async () => {
    try {
      const cachedHeadlines = sessionStorage.getItem('topHeadlines');

      if (cachedHeadlines) {
        setHeadlines(JSON.parse(cachedHeadlines));
      } else {
        const data = await getTopHeadlines();
        setHeadlines(data?.articles || []);
        sessionStorage.setItem('topHeadlines', JSON.stringify(data?.articles || []));
      }
    } catch (error) {
      console.error('Error fetching headlines:', error);
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

  if (!session) {
    return null;
  }

  return (
    <AppLayout title="Headlines - Twitter 2.0">
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
              <h1 className="text-xl font-bold">Headlines</h1>
              <p className="text-sm text-gray-500">Top news from the US</p>
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
              {headlines.map((article, index) => (
                <article
                  key={article.url || index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="md:flex md:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 md:mb-0 mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                            {article.source.name}
                          </span>
                          <span className="text-sm text-gray-500 hidden md:inline">•</span>
                          <span className="text-sm text-gray-500 hidden md:inline">
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>
                        <div className="md:hidden">
                          <span className="text-sm text-gray-500">
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold mb-2 md:line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Mobile image placement - after headline */}
                      {article.urlToImage && (
                        <div className="md:hidden mb-3">
                          <img
                            src={article.urlToImage}
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
                      {article.author && (
                        <p className="text-sm text-gray-500 mb-2">
                          By {article.author}
                        </p>
                      )}
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-lightblue-500 hover:text-lightblue-600 text-sm font-medium"
                      >
                        Read full article
                        <ExternalLinkIcon className="ml-1 w-4 h-4" />
                      </a>
                    </div>

                    {/* Desktop image placement - on the right */}
                    {article.urlToImage && (
                      <div className="hidden md:block md:flex-shrink-0">
                        <img
                          src={article.urlToImage}
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

export default Headlines;