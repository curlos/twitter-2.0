import React from 'react';
import Spinner from '../Spinner';

interface ContentContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="flex justify-center mt-4 flex-grow w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex-grow text-lg border-r border-[#AAB8C2] dark:border-gray-700 ${className}`}>
      {children}
      <div className="h-[60px]" />
    </div>
  );
};

export default ContentContainer;