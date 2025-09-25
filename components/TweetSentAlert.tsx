import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { tweetSentAlertState } from '../atoms/atom';

export const TweetSentAlert: React.FC = () => {
  const [alertState, setAlertState] = useRecoilState(tweetSentAlertState);
  const router = useRouter();

  useEffect(() => {
    if (alertState.isVisible) {
      const timer = setTimeout(() => {
        setAlertState({
          isVisible: false,
          tweetId: '',
          message: 'Your tweet was sent'
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alertState.isVisible, setAlertState]);

  const handleViewClick = () => {
    if (alertState.tweetId) {
      router.push(`/tweet/${alertState.tweetId}`);
    }
    setAlertState({
      isVisible: false,
      tweetId: '',
      message: 'Your tweet was sent'
    });
  };

  if (!alertState.isVisible) {
    return null;
  }

  return (
    <div className="fixed left-4 bottom-20 lg:bottom-4 z-50 animate-slide-in-left">
      <div className="bg-lightblue-500 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm drop-shadow-lg flex items-center gap-3 max-w-xs">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{alertState.message}</p>
        </div>
        {alertState.tweetId && (
          <button
            onClick={handleViewClick}
            className="bg-white text-lightblue-500 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 focus:outline-none transition-colors"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};