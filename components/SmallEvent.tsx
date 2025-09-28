import React from 'react';

interface News {
  title?: string;
  image_url?: string;
  link?: string;
  source_name?: string;
  source_icon?: string;
}
interface Props {
  news?: News;
}

/**
 * @description - Shows a small event happening on the widgets on the RIGHT sidebar. On the real site, there would also be trending topics as well but this doesn't have any real users to populate enough tweets for something to be trending in real time so ONLY show events. For now, it's based off of video game news.
 * @returns {React.FC}
 */
const SmallEvent = ({ news }: Props) => {
  const { title, image_url, link, source_name, source_icon } = news;

  return (
    <div className="grid grid-cols-smallEvent cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-4 gap-2" onClick={() => window.open(link, '_blank')}>
      <div>
        <div className="font-bold mb-1">{title}</div>
        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400">
          {source_icon && (
            <img
              src={source_icon}
              alt=""
              className="w-5 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {source_name}
        </div>
      </div>

      {image_url && (
        <div className="flex justify-center items-center">
          <img src={image_url} alt="" className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default SmallEvent;
