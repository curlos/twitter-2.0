import React from 'react';

interface News {
  title?: string;
  urlToImage?: string;
  url?: string;
}
interface Props {
  news?: News;
}

/**
 * @description - Shows a small event happening on the widgets on the RIGHT sidebar. On the real site, there would also be trending topics as well but this doesn't have any real users to populate enough tweets for something to be trending in real time so ONLY show events. For now, it's based off of video game news.
 * @returns {React.FC}
 */
const SmallEvent = ({ news }: Props) => {
  const { title, urlToImage, url } = news;

  return (
    <div className="grid grid-cols-smallEvent cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-4 gap-2" onClick={() => window.location.href = url}>
      <div className="font-bold">{title}</div>

      {urlToImage && (
        <div className="flex justify-center items-center">
          <img src={urlToImage} alt="" className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default SmallEvent;
