import React from 'react';

/**
 * @description - Renders a light blue (same color as the Twitter bird) ANIMATED spinner. This is typically shown when we make an API request to firebase and we're waiting for the request to finish. So while it's loading, this spinner will be shown.
 * @returns {React.FC}
 */
const Spinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-spin ease-linear rounded-full border-4 border-t-4 border-gray-200 border-t-lightblue-500 h-12 w-12 mb-4"></div>
    </div>
  );
};

export default Spinner;
