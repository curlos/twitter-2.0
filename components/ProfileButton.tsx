import React from "react";
import { DotsHorizontalIcon, LogoutIcon, UserIcon } from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { HiBadgeCheck } from "react-icons/hi";

interface ProfileButtonProps {
  onMenuItemClick?: () => void;
}

const ProfileButton = ({ onMenuItemClick }: ProfileButtonProps) => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center justify-between mt-3 w-100">
      <div className="relative w-full">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button className="flex items-center space-x-2 w-full xl:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-base">
                <img src={session.user.profilePic} alt={`${session.user.tag}'s profile pic`} className="rounded-full xl:w-[55px] xl:h-[55px] object-cover" />
                <div className="hidden xl:flex flex-col w-full">
                  <div className="flex items-center">
                    <div className="text-left truncate max-w-[150px]">{session.user.name}</div>
                    <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
                  </div>
                  <div className="text-gray-500 break-word text-left">@{session.user.tag}</div>
                </div>
                <DotsHorizontalIcon className="hidden xl:block h-5 w-5 text-gray-700 dark:text-gray-400" />
              </Menu.Button>

              <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Menu.Items
                  static
                  className="absolute -top-2 transform -translate-y-full left-0 w-[200px] xl:w-full origin-bottom-left divide-y rounded-md shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
                >
                  <div className="p-1 bg-white dark:bg-black rounded-md">
                    <Menu.Item>
                      {({ close }) => (
                        <Link href={`/profile/${session.user.tag}`}>
                          <div
                            className="bg-white dark:bg-black text-black dark:text-white w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 rounded-md"
                            onClick={() => {
                              close();
                              onMenuItemClick?.();
                            }}
                          >
                            <UserIcon className="h-4 w-4" />
                            <span>View Profile</span>
                          </div>
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ close }) => (
                        <div
                          className="bg-white dark:bg-black text-red-500 w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 rounded-md"
                          onClick={() => {
                            close();
                            onMenuItemClick?.();
                            signOut({ callbackUrl: 'http://localhost:3000/auth' });
                          }}
                        >
                          <LogoutIcon className="h-4 w-4" />
                          <span>Logout</span>
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

export default ProfileButton;