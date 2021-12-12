import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { BadgeCheckIcon, DotsHorizontalIcon, ShareIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/solid'
import { ChatIcon, SwitchVerticalIcon, HeartIcon as HeartIconOutline, SwitchHorizontalIcon, } from '@heroicons/react/outline'
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { modalState, postIdState } from '../atoms/atom';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from '@firebase/firestore';
import { db } from '../firebase';
import { orderBy, query } from 'firebase/firestore';
import { Dropdown } from './Dropdown';

interface Props {
  id: string,
  post: any
}

const Post = ({ id, post }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(modalState)
  const [postId, setPostId] = useRecoilState(postIdState)
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    onSnapshot(query(
      collection(db, 'posts', id, 'comments'),
      orderBy('timestamp', 'desc')
    ),
      (snapshot) => setComments(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    onSnapshot(collection(db, 'posts', id, 'likes'), (snapshot) => setLikes(snapshot.docs))
  }, [db, id])

  useEffect(() => {
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1)
  }, [likes])

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, "posts", id, "likes", session.user.uid))
    } else {
      await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
        username: session.user.name,
      })
    }
  }

  if (id === '1PCD8qJShv5J3cLtJtz6') {
    console.log(liked)
  }

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

            <Dropdown post={post} />
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
              <ChatIcon className="h-5 w-5 cursor-pointer" />
            </div>

            <div className="flex-1">
              <SwitchHorizontalIcon className="h-5 w-5 cursor-pointer" />
            </div>

            <div className="flex-1 flex space-x-2" onClick={(e) => {
              e.stopPropagation()
              likePost()
            }}>
              {!liked ? <HeartIconOutline className={`h-5 w-5 cursor-pointer`} /> : <HeartIconSolid className={`h-5 w-5 cursor-pointer text-red-400`} />}
              <div className="text-red-400">{likes.length}</div>
            </div>

            <div className="flex-1">
              <ShareIcon className="h-5 w-5 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
      {/* {post.text} */}
    </div>
  )
}

export default Post
