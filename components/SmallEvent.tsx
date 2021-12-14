import React from 'react'

interface Props {
  image?: boolean
}

const SmallEvent = ({ image }: Props) => {
  return (
    <div className="flex justify-between cursor-pointer hover:bg-gray-700 px-3 py-2">
      <div>
        <div className="text-gray-400">
          <span>NBA</span>
          <span> · </span>
          <span>Trending</span>
        </div>
        <div className="font-bold">Kyrie Irving</div>
        <div className="text-gray-400 text-sm">5,794 Tweets</div>
      </div>

      {image && (
        <div>
          <img src="/assets/trending_small.jpeg" alt="" className="rounded-lg h-[68px] w-[68px] object-cover" />
        </div>
      )}
    </div>
  )
}

export default SmallEvent
