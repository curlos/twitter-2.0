/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from 'recoil'
import { colorThemeState, newTweetModalState, tweetIdState } from '../atoms/atom'
import { XIcon } from '@heroicons/react/solid'
import { useSession } from 'next-auth/react'
import Input from './Input'
import { DocumentData, onSnapshot } from '@firebase/firestore'
import { doc } from 'firebase/firestore'
import { db } from '../firebase'
import ParentTweet from './ParentTweet'
import { ITweet } from '../utils/types'

export const NewTweetModal = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweetId, setTweetId] = useRecoilState(tweetIdState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [tweet, setTweet] = useState<ITweet>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tweetId) {
      onSnapshot(doc(db, 'tweets', tweetId), (snapshot) => {
        setTweet(snapshot.data() as ITweet)
        setLoading(false)
      })
    }
  }, [db])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={(val) => {
        setIsOpen(val)
        setTweetId('')
      }}>
        <div className={`${theme} flex items-center justify-center min-h-screen p-2 lg:pt-4 lg:px-4 lg:pb-20 text-center sm:block sm:p-0`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle h-screen lg:h-full" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 align-top max-w-lg w-[95vw] lg:w-[50vw]">
              <div className="bg-white dark:bg-black p-3 border-b border-[#AAB8C2] dark:border-gray-700">
                <div>
                  <XIcon className="h-7 w-7 cursor-pointer text-gray-400 dark:text-white hover:text-gray-500" onClick={(val) => {
                    setIsOpen(false)
                    setTweetId('')
                  }} />
                </div>
              </div>

              {!loading && <ParentTweet tweet={tweet} fromModal={true} />}

              <Input replyModal={String(tweetId) !== ''} tweetId={tweetId} />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}