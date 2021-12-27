import { BadgeCheckIcon } from '@heroicons/react/solid'
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import Spinner from './Spinner'

interface Props {
  userID: string,

}

const MediumUser = ({ userID }: Props) => {

  const { data: session } = useSession()
  const [user, setUser] = useState<DocumentData>()
  const [followers, setFollowers] = useState<DocumentData>()
  const [followed, setFollowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const docRef = doc(db, "users", userID)
    console.log(userID)
    console.log(docRef)

    getDoc(docRef).then((snap) => {
      console.log(snap.data())
      setUser(snap.data())
      setLoading(false)
    })
  }, [userID])

  useEffect(() => {
    onSnapshot(collection(db, 'users', userID, 'followers'), (snapshot) => setFollowers(snapshot.docs))
  }, [db, userID, loading])

  useEffect(() => {
    if (followers) {
      console.log(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1)
      setFollowed(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1)
    }
  }, [followers])

  const handleFollow = async () => {
    console.log(followed)
    if (followed) {
      await deleteDoc(doc(db, "users", userID, "followers", String(session.user.uid)))
      await deleteDoc(doc(db, "users", String(session.user.uid), "following", userID))
    } else {
      await setDoc(doc(db, "users", userID, "followers", String(session.user.uid)), {
        followedAt: serverTimestamp(),
        followedBy: session.user.uid
      })
      await setDoc(doc(db, "users", String(session.user.uid), "following", userID), {
        followedAt: serverTimestamp(),
        followedBy: session.user.uid
      })
    }
  }

  console.log(followers)
  console.log(followed)

  return (
    loading ? <Spinner /> : (
      <Link href={`/profile/${user.tag}`}>
        <div className="p-3 flex justify-between items-center text-base cursor-pointer hover:bg-gray-800">
          <div className="flex gap-2">
            <Link href={`/profile/${user.tag}`}>
              <img src={user.profilePic} alt={user.name} className="h-[55px] w-[55px] rounded-full cursor-pointer" />
            </Link>

            <div>
              <Link href={`/profile/${user.tag}`}>
                <div className="flex items-center gap-1 font-semibold cursor-pointer hover:underline">
                  <div>{user.name}</div>
                  <div><BadgeCheckIcon className="h-[18px] w-[18px]" /></div>
                </div>
              </Link>
              <div className="text-gray-400">@{user.tag}</div>

              <div>{user.bio}</div>
            </div>
          </div>

          {userID !== session.user.uid ? (
            <div className="font-semibold text-sm px-4 py-2 text-black bg-white rounded-full" onClick={(e) => {
              e.stopPropagation()
              handleFollow()
            }}>{followed ? 'Following' : 'Follow'}</div>
          ) : null}


        </div>
      </Link>
    )
  )
}

export default MediumUser