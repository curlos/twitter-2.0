import { SearchIcon } from '@heroicons/react/outline'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import React from 'react'
import SmallEvent from './SmallEvent'
import SmallUser from './SmallUser'

const Widgets = () => {
  return (
    <div className="pl-3 py-2 space-y-5">
      <div className="flex items-center w-[350px]">
        <div className="text-gray-500 bg-gray-800 p-3 rounded-l-full">
          <SearchIcon className="h-6 w-6" />
        </div>
        <input placeholder="Search Twitter" className="bg-gray-800 rounded-r-full p-3 w-[300px] focus:outline-none"></input>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-4 w-[350[x]">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>

        <SmallUser />
        <SmallUser />
        <SmallUser />
      </div>

      <div className="bg-gray-800 rounded-lg py-3 w-[350px]">
        <h2 className="text-xl font-bold mb-4 px-3">What's happening</h2>

        <SmallEvent image={true} />
        <SmallEvent />
        <SmallEvent />
        <SmallEvent />

        <div>
          <button className="cursor-pointer text-lightblue-400 hover:underline px-3 pt-3">Show more</button>
        </div>
      </div>
    </div>
  )
}

export default Widgets
