import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";

interface Props {
  tweet: any,
  deleteTweet: any
}

export const Dropdown = ({ tweet, deleteTweet }: Props) => {
  const { data: session } = useSession()

  return (
    <div className="flex items-center justify-center shadow-lg">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md shadow-sm">
                <Menu.Button className="inline-flex justify-center w-full px-4 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-black rounded-md ">
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
                  className="absolute right-0 w-56 mt-2 origin-top-right divide-y divide-black rounded-md shadow-gray-500 shadow-lg outline-none border border-gray-500"
                >

                  <div className="py-1 bg-black rounded-md" onClick={deleteTweet}>
                    {tweet.tag === session.user.tag && (
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={`bg-black w-full px-4 py-2 text-sm leading-5 text-left text-red-500 hover:bg-gray-900 cursor-pointer`}
                          >
                            Delete
                          </div>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={`bg-black text-white w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-900 z-50`}
                        >
                          Follow @{tweet.tag}
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
}
