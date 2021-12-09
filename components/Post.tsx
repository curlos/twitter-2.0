import React, { useEffect } from 'react'
import Image from "next/image";
import { BadgeCheckIcon, DotsHorizontalIcon, ShareIcon } from '@heroicons/react/solid'
import { ChatIcon, SwitchVerticalIcon, HeartIcon, SwitchHorizontalIcon, } from '@heroicons/react/outline'
import moment from 'moment';

interface Props {
  id: string,
  post: any
}

const Post = ({ id, post }: Props) => {


  console.log(post)

  return (
    <div className="text-base p-3 border-b border-gray-500 w-full">
      <div className="flex">
        <div className="mr-2">
          <img src={post.userImg} alt={post.username} height={60} width={60} className="rounded-full h-[55px] w=[55px]" />
        </div>
        <div className="flex flex-col justify-between w-full">
          <div className="flex justify-between w-full">
            <div className="flex">
              <div className="flex">{post.username} <BadgeCheckIcon className="h-5 w-5" /></div>
              <div className="text-gray-500">@{post.tag}</div>
              <div className="text-gray-500 mx-1 font-bold">·</div>
              {post.timestamp && post.timestamp.seconds && (
                <div className="text-gray-500">{moment(post.timestamp.seconds * 1000).fromNow()}</div>
              )}
            </div>

            <DotsHorizontalIcon className="text-gray-500 h-5 w-5" />
          </div>

          <div className="pb-3">
            <div>{post.text}</div>
            {post.image && (
              <div className="pt-3">
                <img src={post.image} alt="" className="rounded-2xl max-h-80 object-contain" />
              </div>
            )}
          </div>

          <div className="flex justify-start w-full text-gray-500">
            <div className="flex-1">
              <ChatIcon className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <SwitchHorizontalIcon className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <HeartIcon className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <ShareIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
      {/* {post.text} */}
    </div>
  )
}

export default Post
