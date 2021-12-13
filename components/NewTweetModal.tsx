/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import { useRecoilState } from 'recoil'
import { newTweetModalState, tweetIdState } from '../atoms/atom'
import { XIcon } from '@heroicons/react/solid'
import { useSession } from 'next-auth/react'
import TextareaAutosize from 'react-textarea-autosize';
import Input from './Input'
import { DocumentData, onSnapshot } from '@firebase/firestore'
import { useRouter } from 'next/router'
import { doc } from 'firebase/firestore'
import { db } from '../firebase'
import Post from './Tweet'
import TweetReplyContent from './TweetReplyContent'
import ParentTweet from './ParentTweet'

export const NewTweetModal = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweetId, setTweetId] = useRecoilState(tweetIdState)
  const [tweet, setTweet] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)

  console.log('modal')
  console.log(tweetId)

  useEffect(() => {
    if (tweetId) {
      onSnapshot(doc(db, 'tweets', tweetId), (snapshot) => {
        setTweet(snapshot.data())
        setLoading(false)
      })
    }
  }, [db])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={(val) => {
        setIsOpen(val)
        setTweetId('')
      }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
            <div className="inline-block align-bottom bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top sm:max-w-lg sm:w-full">
              <div className="bg-black p-3 border-b border-gray-500">
                <div>
                  <XIcon className="h-7 w-7 cursor-pointer" onClick={(val) => {
                    setIsOpen(false)
                    setTweetId('')
                  }} />
                </div>
              </div>

              {!loading && <ParentTweet tweet={tweet} />}

              <Input />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}