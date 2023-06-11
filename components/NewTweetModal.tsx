import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, tweetBeingRepliedToIdState, editTweetState } from '../atoms/atom';
import { XIcon } from '@heroicons/react/solid';
import Input from './Input';
import { onSnapshot } from '@firebase/firestore';
import { doc } from 'firebase/firestore';
import { db } from '../firebase';
import ParentTweet from './ParentTweet';
import { ITweet } from '../utils/types';

/**
 * @description - Renders a modal with the "Input" component that will allow a user to create a new tweet (this tweet can be a new tweet, a reply or a new edit)
 * @returns {React.FC}
 */
export const NewTweetModal = () => {
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const [showEmojiState, setShowEmojiState] = useState(false);
  const [tweetBeingRepliedToId, setTweetBeingRepliedToId] = useRecoilState(tweetBeingRepliedToIdState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const [editTweetInfo, setEditTweetInfo] = useRecoilState(editTweetState);

  const handleClose = () => {
    setIsOpen(false);
    // Need to set the tweetId as empty as well because if not then the next time the modal is open, it would be possible to see the tweet that was being replied to show up AGAIN even if you're drafting a completely new tweet that is NOT a reply.
    setTweetBeingRepliedToId('');
    setEditTweetInfo({
      image: '',
      parentTweet: '',
      text: '',
      timestamp: {
        seconds: 0,
        nanoseconds: 0,
      },
      userID: '',
      retweetedBy: '',
      tweetId: ''
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={handleClose}>
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
                  <XIcon className="h-7 w-7 cursor-pointer text-gray-400 dark:text-white hover:text-gray-500" onClick={handleClose} />
                </div>
              </div>

              {/* This will only show up if there's a tweet to reply to (meaning if there's a "tweetId" in the state.) */}
              <ParentTweet fromModal={true} />

              <Input editTweetInfo={editTweetInfo} replyModal={String(tweetBeingRepliedToId) !== ''} tweetBeingRepliedToId={tweetBeingRepliedToId} showEmojiState={showEmojiState} setShowEmojiState={setShowEmojiState} />

              {/* Have to show this additional container below the input because for some reason this emoji picker library gets cut off by the container if it's too short. The minimum for comfortability purposes that I saw was "430px". */}
              {/* TODO: Find out if there's a way to display the emoji picker in the modal without extending the modal's container. If not, find a different library to use. */}
              {showEmojiState && (
                <div className="h-[430px] w-full p-2" />
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};