import { BadgeCheckIcon } from '@heroicons/react/solid'
import React from 'react'

const SmallUser = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src="/assets/profile_icon.jpeg" alt="" className="rounded-full h-[55px] w-[55px] object-cover" />

        <div>
          <div className="flex">
            <div>Los Angeles Lakers</div>
            <BadgeCheckIcon className="h-5 w-5" />
          </div>

          <div className="text-gray-400">
            @Lakers
          </div>
        </div>
      </div>

      <div>
        <button className="py-2 px-3 bg-white text-sm text-black font-bold rounded-full">Follow</button>
      </div>
    </div>
  )
}

export default SmallUser
