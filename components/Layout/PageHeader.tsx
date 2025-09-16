import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backPath = '/',
  onBackClick,
  children
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push(backPath);
    }
  };

  return (
    <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white text-black dark:bg-black dark:text-white sticky top-0 z-[50]">
      {showBackButton && (
        <div className="cursor-pointer mx-3" onClick={handleBackClick}>
          <ArrowLeftIcon className="h-6 w-6" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-center mb-0 p-0">
          <h2 className="font-bold text-xl">{title}</h2>
        </div>
        {subtitle && (
          <div className="text-gray-400 text-sm">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;