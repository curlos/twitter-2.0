import React from 'react'
import { SparklesIcon } from '@heroicons/react/outline'
import Input from './Input'

const Feed = () => {
  return (
    <div className="flex-grow lg:ml-[280px] text-lg border-r border-gray-500">
      <div className="flex justify-between border-b border-gray-500 p-3">
        <h2 className="font-bold">Home</h2>
        <SparklesIcon className="h-5 w-5" />
      </div>

      <Input />

    </div>
  )
}

export default Feed
