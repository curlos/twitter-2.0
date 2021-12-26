import React from 'react'

interface Props {
  image?: boolean
}

const SmallEvent = ({ image }: Props) => {
  return (
    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-700 px-3 py-2">
      <div className="">
        <div className="text-gray-400">
          <span>NBA</span>
          <span> · </span>
          <span>Trending</span>
        </div>
        <div className="font-bold">The Los Angeles Lakers host the Brooklyn Nets for a Christmas Day showdown</div>
        <div className="text-gray-400 text-sm">97.6K Tweets</div>
      </div>

      {image && (
        <div className="">
          <img src="/assets/bron&ad.jpeg" alt="" className="rounded-lg h-[68px] w-[68px] object-cover" />
        </div>
      )}
    </div>
  )
}

export default SmallEvent
