import React from 'react';

const SkeletonActionButton = ({ iconSize = 'h-[18px] w-[18px]' }: { iconSize?: string }) => (
  <div className="flex-1 items-center flex">
    <div className="flex items-center space-x-2 p-2 rounded-full">
      <div className={`${iconSize} bg-gray-300 dark:bg-gray-600 rounded`}></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
    </div>
  </div>
);

const SkeletonBar = ({ width }: { width: string }) => (
  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${width}`}></div>
);

const TweetSkeletonLoader = () => {
  return (
    <div className="p-3 border-b border-[#AAB8C2] dark:border-gray-700 animate-pulse">
      <div className="flex">
        <div className="mr-2">
          <div className="rounded-full h-[55px] w-[55px] bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <div className="flex flex-col justify-between w-full">
          <div className="flex justify-between w-full">
            <div className="sm:flex">
              <div className="flex space-x-2">
                <SkeletonBar width="w-24" />
                <SkeletonBar width="w-16" />
              </div>
              <div className="hidden sm:block h-4 bg-gray-300 dark:bg-gray-600 rounded w-1 mx-1"></div>
              <div className="mt-2 sm:mt-0">
                <SkeletonBar width="w-12" />
              </div>
            </div>
            <SkeletonBar width="w-4" />
          </div>

          <div className="py-3 space-y-2">
            <SkeletonBar width="w-full" />
            <SkeletonBar width="w-3/4" />
          </div>

          <div className="flex justify-start w-full text-gray-500">
            <SkeletonActionButton />
            <SkeletonActionButton />
            <SkeletonActionButton />
            <SkeletonActionButton iconSize="h-[16px] w-[16px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetSkeletonLoader;