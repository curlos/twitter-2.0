import React from 'react';

interface News {
  date?: string;
  description?: string;
  image?: string;
  link?: string;
  title?: string;
}
interface Props {
  news?: News;
}

const SmallEvent = ({ news }: Props) => {
  const { title, image, link } = news;

  return (
    <div className="grid grid-cols-smallEvent cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-4 gap-2" onClick={() => window.location.href = link}>
      <div className="">
        <div className="text-gray-400">
          <span>Video Games</span>
          <span> · </span>
          <span>Trending</span>
        </div>
        <div className="font-bold">{title}</div>
        <div className="text-gray-400 text-sm">500.6K Tweets</div>
      </div>

      {image && (
        <div className="flex justify-center items-center">
          <img src={image} alt="" className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default SmallEvent;
