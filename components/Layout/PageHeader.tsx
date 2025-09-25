import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-3 px-5 bg-white text-black dark:bg-black dark:text-white sticky top-0 z-[50]">
      <div className="cursor-pointer mx-3" onClick={() => router.back()}>
        <ArrowLeftIcon className="h-6 w-6 ml-[-12px]" />
      </div>
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