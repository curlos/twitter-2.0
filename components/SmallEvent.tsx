import React from 'react'

interface Props {
  image?: boolean
}

const SmallEvent = ({ image }: Props) => {
  return (
    <div className="grid grid-cols-smallEvent cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2">
      <div className="">
        <div className="text-gray-400">
          <span>NFL</span>
          <span> · </span>
          <span>Trending</span>
        </div>
        <div className="font-bold">Bills vs. Chiefs final score, results: KC wins OT thriller, reaches fourth consecutive AFC championship</div>
        <div className="text-gray-400 text-sm">500.6K Tweets</div>
      </div>

      {image && (
        <div className="flex justify-center items-center">
          <img src="/assets/kc-chiefs.jpeg" alt="" className="rounded-lg" />
        </div>
      )}
    </div>
  )
}

export default SmallEvent
