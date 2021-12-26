import moment from 'moment'
import React from 'react'

interface Props {
  tweet: any
}

const ParentTweet = ({ tweet }: Props) => {
  return (
    <div className="flex p-3 space-x-2 pb-0 h-full">
      <div className="h-full">
        <img src={tweet.profilePic} alt="" className="rounded-full h-[55px] w-[55px] object-cover" />
        <span className="border-r-2 border-gray-500 h-1/2 absolute ml-[27px]" />
      </div>

      <div>
        <div className="flex text-gray-400">
          <div className="text-white mr-[2px]">{tweet.username}</div>
          <div>@{tweet.tag}</div>
          <div className="text-gray-500 mx-1 font-bold">·</div>
          {tweet.timestamp && tweet.timestamp.seconds && (
            <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
          )}
        </div>

        <div>
          <div>{tweet.text}</div>

          {tweet.image && (
            <div className="pt-3">
              <img src={tweet.image} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}
        </div>
        <div className="my-3 text-gray-400">
          Replying to <span className="text-lightblue-400">@{tweet.tag}</span>
        </div>
      </div>
    </div>

  )
}

export default ParentTweet