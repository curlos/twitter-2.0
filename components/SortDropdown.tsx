import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";

interface Props {
  sortType: string,
  setSortType: React.Dispatch<React.SetStateAction<string>>;
  options?: string[];
}

/**
 * @description - Renders a dropdown (typically for a list of tweets) and when one of the options in the dropdown is clicked, the list of tweets will be sorted accordingly.
 * @returns {React.FC}
 */
export const SortDropdown = ({ sortType, setSortType, options }: Props) => {

  const defaultOptions = ['Newest', 'Oldest', 'Most Likes', 'Most Replies', 'Most Bookmarks', 'Most Retweets'];
  const dropdownOptions = options || defaultOptions;

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
                  {dropdownOptions.map((option, index) => {
                    const isFirst = index === 0;
                    const isLast = index === dropdownOptions.length - 1;

                    let roundedClasses = "rounded-md";
                    if (dropdownOptions.length > 1) {
                      if (isFirst) {
                        roundedClasses = "rounded-md rounded-b-none";
                      } else if (isLast) {
                        roundedClasses = "rounded-md rounded-t-none";
                      } else {
                        roundedClasses = "rounded-md rounded-t-none rounded-b-none";
                      }
                    }

                    return (
                      <div
                        key={option}
                        className={`bg-white dark:bg-black ${roundedClasses} divide-gray-400 dark:divide-gray-700`}
                        onClick={() => setSortType(option)}
                      >
                        <Menu.Item>
                          {() => (
                            <div
                              className={`w-full ${roundedClasses} px-4 py-3 text-sm leading-5 text-left hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer`}
                            >
                              {option}
                            </div>
                          )}
                        </Menu.Item>
                      </div>
                    );
                  })}
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};
