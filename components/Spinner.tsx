import React from 'react'

const Spinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-16 h-16 inline-block border-b-4 border-l-4 border-lightblue-400 rounded-full animate-spin"></div>
    </div>
  )
}

export default Spinner
