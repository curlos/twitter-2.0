import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { IAuthor, ITweet } from "../utils/types";
import { collection, deleteDoc, doc, DocumentData, getDoc, onSnapshot, serverTimestamp, setDoc } from "@firebase/firestore";
import { db } from "../firebase";

interface Props {
  tweet: ITweet,
  deleteTweet: (e: React.FormEvent) => Promise<void>,
  author: IAuthor,
  authorId: string
}

export const Dropdown = ({ tweet, author, authorId, deleteTweet }: Props) => {
  const { data: session } = useSession()
  const [user, setUser] = useState<DocumentData>()
  const [followers, setFollowers] = useState<DocumentData>()
  const [followed, setFollowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docRef = doc(db, "users", authorId)

    getDoc(docRef).then((snap) => {
      setUser(snap.data())
      setLoading(false)
    })
  }, [authorId])

  useEffect(() => {
    onSnapshot(collection(db, 'users', authorId, 'followers'), (snapshot) => setFollowers(snapshot.docs))
  }, [db, authorId, loading])

  useEffect(() => {
    if (followers) {
      setFollowed(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1)
    }

    setLoading(false)
  }, [followers])

  const handleFollow = async () => {
    if (!session) {
      return {
        redirect: {
          permanent: false,
          destination: '/'
        }
      }
    }

    if (followed) {
      await deleteDoc(doc(db, "users", authorId, "followers", String(session.user.uid)))
      await deleteDoc(doc(db, "users", String(session.user.uid), "following", authorId))
    } else {
      await setDoc(doc(db, "users", authorId, "followers", String(session.user.uid)), {
        followedAt: serverTimestamp(),
        followedBy: session.user.uid
      })
      await setDoc(doc(db, "users", String(session.user.uid), "following", authorId), {
        followedAt: serverTimestamp(),
        followedBy: session.user.uid
      })
    }
  }

  return (
    <div className="flex items-center justify-center" onClick={(e) => e.preventDefault()}>
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md">
                <Menu.Button className="inline-flex justify-center w-full px-4 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-transparent rounded-md ">
                  <span><DotsHorizontalIcon className="h-5 w-5 text-gray-400 cursor-pointer" /></span>
                </Menu.Button>
              </span>

              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className="absolute right-0 w-56 mt-2 origin-top-right divide-y rounded-md shadow-gray-500 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
                >

                  <div className="py-1 bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700">
                    {session && session.user && author.tag === session.user.tag && (
                      <Menu.Item onClick={deleteTweet}>
                        {({ active }) => (
                          <div
                            className={`bg-white dark:bg-black w-full px-4 py-2 text-sm leading-5 text-left text-red-500 hover:bg-gray-900 cursor-pointer`}
                          >
                            Delete
                          </div>
                        )}
                      </Menu.Item>
                    )}
                    {!loading ? (
                      <Menu.Item onClick={handleFollow}>
                        {({ active }) => (
                          <div
                            className={`bg-white dark:bg-black text-black dark:text-white w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-900 z-50`}
                          >
                            {!followed ? `Follow` : 'Unfollow'} @{author.tag}
                          </div>
                        )}
                      </Menu.Item>
                    ) : null}

                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
}
