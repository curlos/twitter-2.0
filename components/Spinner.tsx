import React from 'react';

/**
 * @description - 
 * @returns {React.FC}
 */
const Spinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
    </div>
  );
};

export default Spinner;
