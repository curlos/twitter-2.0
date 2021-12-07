import React from 'react'
import Image from "next/image";
import { SparklesIcon } from '@heroicons/react/outline'
import TextareaAutosize from 'react-textarea-autosize';

const Feed = () => {
  return (
    <div className="flex-grow lg:ml-[280px] text-lg font-bold">
      <div className="flex justify-between border-b border-gray-500 p-3">
        <span>Home</span>
        <SparklesIcon className="h-5 w-5" />
      </div>

      <div className="p-2 space-x-4">
        <Image src="/assets/pucci.jpeg" width={50} height={50} className="rounded-full cursor-pointer" />

        <TextareaAutosize className="bg-black outline-none placeholder-gray-500 min-h-[50px]" placeholder="What's happening?" />
      </div>


    </div>
  )
}

export default Feed
