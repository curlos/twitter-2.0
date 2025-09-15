import React from 'react';

const SkeletonBar = ({ width }: { width: string }) => (
  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${width}`}></div>
);

const MediumUserSkeletonLoader = () => {
  return (
    <div className="p-3 flex justify-between items-center gap-2 text-base animate-pulse">
      <div className="flex gap-2">
        <div className="rounded-full h-[55px] w-[55px] bg-gray-300 dark:bg-gray-600"></div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <SkeletonBar width="w-24" />
            <div className="h-[18px] w-[18px] bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>

          <SkeletonBar width="w-20" />

          <div className="space-y-1">
            <SkeletonBar width="w-48" />
            <SkeletonBar width="w-32" />
          </div>
        </div>
      </div>

      <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
  );
};

export default MediumUserSkeletonLoader;