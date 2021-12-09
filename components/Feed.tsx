import React, { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/outline'
import { db } from "../firebase";
import Input from './Input'
import { useSession } from 'next-auth/react';
import { onSnapshot, query } from '@firebase/firestore';
import { collection, orderBy } from 'firebase/firestore';
import Post from './Post';

const Feed = () => {

  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => onSnapshot(
    query(collection(db, "posts"), orderBy("timestamp", "desc")),
    (snapshot) => {
      setPosts(snapshot.docs)
      setLoading(false)
    }
  ), [db])

  return (
    loading ? <div>Loading...</div> : (
      <div className="flex-grow lg:ml-[280px] text-lg border-r border-gray-500">
        <div className="flex justify-between border-b border-gray-500 p-3">
          <h2 className="font-bold">Home</h2>
          <SparklesIcon className="h-5 w-5" />
        </div>


        <Input />
        {posts.map((post) => <Post key={post.id} id={post.id} post={post.data()} />)}

      </div>
    )
  )
}

export default Feed
