import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";

interface Props {
  sortType: string,
  setSortType: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * @description - Renders a dropdown (typically for a list of tweets) and when one of the options in the dropdown is clicked, the list of tweets will be sorted accordingly.
 * @returns {React.FC}
 */
export const SortDropdown = ({ sortType, setSortType }: Props) => {

  return (
    <div className="flex items-center justify-end">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md shadow-sm">
                <Menu.Button className="inline-flex justify-center w-full px-4 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white dark:bg-black rounded-md">
                  <span className="flex gap-2 p-2">
                    <span className="text-black dark:text-white">{sortType}</span>
                    <DotsHorizontalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  </span>
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
                  className="absolute right-0 w-56 mt-2 origin-top-right rounded-md shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100] mr-5"
                >

                  {/* When this clicked, the list of tweets will be sorted by the NEWEST ones. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400  dark:divide-gray-700 rounded-b-none rounded-t-none" onClick={() => setSortType('Newest')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-b-none rounded-t-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Newest
                        </div>
                      )}
                    </Menu.Item>
                  </div>

                  {/* When this clicked, the list of tweets will be sorted by the OLDEST ones. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700 rounded-t-none rounded-b-none" onClick={() => setSortType('Oldest')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-t-none rounded-b-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Oldest
                        </div>
                      )}
                    </Menu.Item>
                  </div>

                  {/* When this clicked, the list of tweets will be sorted by MOST LIKES. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700 rounded-t-none rounded-b-none" onClick={() => setSortType('Most Likes')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-t-none rounded-b-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Most Likes
                        </div>
                      )}
                    </Menu.Item>
                  </div>

                  {/* When this clicked, the list of tweets will be sorted by MOST REPLIES. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700 rounded-t-none rounded-b-none" onClick={() => setSortType('Most Replies')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-t-none rounded-b-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Most Replies
                        </div>
                      )}
                    </Menu.Item>
                  </div>

                  {/* When this clicked, the list of tweets will be sorted by MOST BOOKMARKS. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700 rounded-t-none rounded-b-none" onClick={() => setSortType('Most Bookmarks')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-t-none rounded-b-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Most Bookmarks
                        </div>
                      )}
                    </Menu.Item>
                  </div>

                  {/* When this clicked, the list of tweets will be sorted by MOST RETWEETS. */}
                  <div className="bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700 rounded-t-none" onClick={() => setSortType('Most Retweets')}>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`w-full rounded-md rounded-t-none px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                        >
                          Most Retweets
                        </div>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};
