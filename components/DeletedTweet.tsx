import React from 'react';

/**
 * @description - This will be shown IF a tweet has been DELETED by the author.
 * @returns {React.FC}
 */
const DeletedTweet = () => {
  return (
    <div className="p-3">
      <div className="bg-gray-200 border border-gray-300 text-gray-400 rounded-xl p-2 py-3 text-base dark:border-gray-700 dark:bg-gray-800">This Tweet is unavailable.</div>
    </div>
  );
};

export default DeletedTweet;