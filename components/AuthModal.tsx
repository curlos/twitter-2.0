import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { colorThemeState, authModalState } from '../atoms/atom';
import { XIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { BsTwitter } from 'react-icons/bs';

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useRecoilState(authModalState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAuthRedirect = () => {
    setIsOpen(false);
    router.push('/auth');
  };

  return (
    <Transition.Root show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={() => handleClose()}>
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
            <div className="inline-block bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 align-top max-w-md w-[95vw] lg:w-[400px]">
              <div className="bg-white dark:bg-black p-3 border-b border-[#AAB8C2] dark:border-gray-700">
                <div>
                  <XIcon className="h-7 w-7 cursor-pointer text-gray-400 dark:text-white hover:text-gray-500" onClick={handleClose} />
                </div>
              </div>

              <div className="bg-white dark:bg-black p-6 text-center">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center justify-center gap-2">
                  <BsTwitter className="h-8 w-8 text-lightblue-500" />
                  Join Twitter 2.0 today
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign up or log in to like, retweet, bookmark, and reply to tweets.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleAuthRedirect}
                    className="w-full bg-lightblue-500 hover:bg-lightblue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200"
                  >
                    Sign Up
                  </button>

                  <button
                    onClick={handleAuthRedirect}
                    className="w-full border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold py-3 px-6 rounded-full transition-colors duration-200"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};