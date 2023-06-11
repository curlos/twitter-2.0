/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { colorThemeState, searchModalState } from '../atoms/atom';
import { SearchIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

/**
 * @description - 
 * @returns {React.FC}
 */
export const SearchModal = () => {
  const [isOpen, setIsOpen] = useRecoilState(searchModalState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={(val) => {
        setIsOpen(val);
      }}>
        <div className={`${theme} flex items-start justify-center min-h-screen p-2 lg:pt-4 lg:px-4 lg:pb-20 text-center sm:block sm:p-0`}>
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  router.push(`/?query=${searchQuery}`);
                }} className="flex items-center gap-2" >
                  <SearchIcon className="h-5 w-5 text-gray-400 dark:text-white" />
                  <input type="text" value={searchQuery} placeholder="Search Twitter" className="bg-white dark:bg-black text-black dark:text-white outline-none font-2xl w-full" onChange={(e) => setSearchQuery(e.target.value)} />
                </form>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};