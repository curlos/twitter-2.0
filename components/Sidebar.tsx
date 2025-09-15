import React, { useEffect, useState } from "react";
import { HomeIcon as HomeIconSolid, BookmarkIcon as BookmarkIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/solid";
import {
  HomeIcon,
  BookmarkIcon,
  UserIcon,
  DotsHorizontalIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";
import SidebarLink from "./SidebarLink";
import { signOut, useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { colorThemeState, newTweetModalState, searchModalState, sidenavState } from "../atoms/atom";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import { FaFeatherAlt, FaSearch } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs";

/**
 * @description - Renders the sidebar (only on DESKTOP) that shows the most common pages a user could go to as well as actions they could take such as "Home", "Search", "Bookmarks", "Profile", "Logout", "New Tweet" and information about them such as their profile pic, name and username. The mobile equivalent is the "SidenavDrawer" component.
 * @returns {React.FC}
 */
const Sidebar = () => {

  const { data: session } = useSession();
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, setTheme] = useRecoilState(colorThemeState);
  const [_searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState);
  const [activeLink, setActiveLink] = useState('home');
  const router = useRouter();

  // Get the theme of the user to determine whether or not we'd display the 'light' theme or 'dark' theme
  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);

  // When we click one of the links in the sidebar ("Home", "Bookmarks", or "Profile"), then we want to change the active link to that page. This could also be detected by just going to the page. All that has to happen the router's pathname changing.
  useEffect(() => {
    if (router.pathname.startsWith('/bookmarks')) {
      setActiveLink('bookmarks');
    } else if (router.pathname.startsWith('/profile')) {
      setActiveLink('profile');
    } else {
      setActiveLink('home');
    }
  }, [router.pathname]);

  return (
    <div className={`${theme} hidden sm:flex flex-col fixed h-full px-4 pt-4 overflow-auto scrollbar-hide border-r border-gray-400 dark:border-gray-700 w-[80px] xl:w-[280px] py-4`}>
      <div className="flex flex-col justify-start items-center xl:items-start space-y-6 flex-grow">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <BsTwitter className="h-[30px] w-[30px] text-lightblue-500 dark:text-white" />
        </div>

        {theme === 'dark' ? (
          <div className="cursor-pointer" onClick={() => {
            setTheme('light');
            localStorage.theme = 'light';
          }}>
            <SunIcon className="h-[30px] w-[30px] dark:text-white" />
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => {
            setTheme('dark');
            localStorage.theme = 'dark';
          }}>
            <MoonIcon className="h-[30px] w-[30px] dark:text-white" />
          </div>
        )}

        <SidebarLink text="Home" Icon={HomeIcon} IconSolid={HomeIconSolid} active={activeLink === 'home'} />

        <div className={`flex items-center space-x-2 text-xl cursor-pointer`} onClick={() => setSearchModalOpen(true)}>
          <FaSearch className="h-7 w-7 cursor-pointer" />
          <div className="hidden xl:block">Search</div>
        </div>

        {session && session.user && <SidebarLink text="Bookmarks" Icon={BookmarkIcon} IconSolid={BookmarkIconSolid} active={activeLink === 'bookmarks'} />}

        {/* Only show if the user is logged in. */}
        {session && session.user && (
          <SidebarLink text="Profile" Icon={UserIcon} IconSolid={UserIconSolid} active={activeLink === 'profile'} tag={session.user.tag} />
        )}


        <button className="hidden xl:flex justify-center items-center bg-lightblue-500 text-white rounded-full px-6 py-4 w-full font-semibold text-lg" onClick={() => {
          if (!session) {
            Router.push('/auth');
            return;
          }
          setIsOpen(true);
        }}>
          Tweet
        </button>

        {/* This is for mobile which by default will show the blue feather to post a tweet. I could remove it if the user is not logged in but for the purpose of the site, I think it'd be better to leave it there and link to the auth page if the user wants to tweet. */}
        <div className="text-white bg-lightblue-400 flex justify-center items-center rounded-full p-4 xl:hidden cursor-pointer" onClick={() => {
          if (!session) {
            Router.push('/auth');
            return;
          }
          setIsOpen(true);
        }}>
          <FaFeatherAlt className="h-5 w-5" />
        </div>
      </div>

      {/* If the user is logged in, then at the bottom of the sidebar they'll see their basic profile info (icon, name, username) with a dropdown menu */}
      {session && session.user && (
        <div className="hidden xl:flex items-center justify-between mt-3 w-100">
          <div className="relative w-full">
            <Menu>
              {({ open }) => (
                <>
                  <Menu.Button className="flex items-center space-x-2 w-full p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    <img src={session.user.profilePic} alt={session.user.name} className="rounded-full w-[55px] h-[55px] object-cover" />
                    <div className="flex flex-col w-full">
                      <div className="text-left">{session.user.name}</div>
                      <div className="text-gray-500 break-word text-left">@{session.user.tag}</div>
                    </div>
                    <DotsHorizontalIcon className="h-5 w-5 text-gray-400" />
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
                      className="absolute -top-2 transform -translate-y-full left-0 w-full origin-bottom-left divide-y rounded-md shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
                    >
                      <div className="p-1 bg-white dark:bg-black rounded-md">
                        <Menu.Item>
                          {() => (
                            <Link href={`/profile/${session.user.tag}`}>
                              <div className="bg-white dark:bg-black text-black dark:text-white w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 rounded-md">
                                <UserIcon className="h-4 w-4" />
                                <span>View Profile</span>
                              </div>
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {() => (
                            <div
                              className="bg-white dark:bg-black text-red-500 w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 rounded-md"
                              onClick={() => signOut({ callbackUrl: 'http://localhost:3000/auth' })}
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
      )}
    </div>
  );
};

export default Sidebar;
