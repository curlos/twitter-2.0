import React, { useEffect, useState } from "react";
import { HomeIcon as HomeIconSolid, BookmarkIcon as BookmarkIconSolid, UserIcon as UserIconSolid, CogIcon as CogIconSolid, NewspaperIcon as NewspaperIconSolid, LoginIcon as LoginIconSolid } from "@heroicons/react/solid";
import {
  HomeIcon,
  BookmarkIcon,
  UserIcon,
  CogIcon,
  NewspaperIcon,
  LoginIcon
} from "@heroicons/react/outline";
import SidebarLink from "./SidebarLink";
import ProfileButton from "./ProfileButton";
import { useSession } from "next-auth/react";
import { useRecoilState, useRecoilValue } from "recoil";
import { colorThemeState, newTweetModalState, searchModalState, authModalState } from "../atoms/atom";
import { useRouter } from "next/router";
import { FaFeatherAlt, FaSearch } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs";

/**
 * @description - Renders the sidebar (only on DESKTOP) that shows the most common pages a user could go to as well as actions they could take such as "Home", "Search", "Bookmarks", "Profile", "Logout", "New Tweet" and information about them such as their profile pic, name and username. The mobile equivalent is the "SidenavDrawer" component.
 * @returns {React.FC}
 */
const Sidebar = () => {

  const { data: session } = useSession();
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const theme = useRecoilValue(colorThemeState);
  const [_searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState);
  const [_authModalOpen, setAuthModalOpen] = useRecoilState(authModalState);
  const [activeLink, setActiveLink] = useState('home');
  const router = useRouter();


  // When we click one of the links in the sidebar ("Home", "Bookmarks", "Profile", or "Settings"), then we want to change the active link to that page. This could also be detected by just going to the page. All that has to happen the router's pathname changing.
  useEffect(() => {
    if (router.pathname.startsWith('/bookmarks')) {
      setActiveLink('bookmarks');
    } else if (router.pathname.startsWith('/profile')) {
      setActiveLink('profile');
    } else if (router.pathname.startsWith('/settings')) {
      setActiveLink('settings');
    } else if (router.pathname.startsWith('/news')) {
      setActiveLink('news');
    } else {
      setActiveLink('home');
    }
  }, [router.pathname]);

  const showLoginAndSignupButtons = !session || !session.user

  return (
    <div className={`${theme} hidden sm:flex flex-col sticky top-0 h-screen px-4 pt-4 xl:overflow-auto scrollbar-hide border-r border-gray-400 dark:border-gray-700 w-[80px] xl:w-[280px] py-4`}>
      <div className="flex flex-col justify-start items-center xl:items-start space-y-6 flex-grow">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <BsTwitter className="h-[30px] w-[30px] text-lightblue-500 dark:text-white" />
        </div>

        <SidebarLink text="Home" Icon={HomeIcon} IconSolid={HomeIconSolid} active={activeLink === 'home'} />

        <div className={`flex items-center space-x-2 text-xl cursor-pointer`} onClick={() => setSearchModalOpen(true)}>
          <FaSearch className="h-7 w-7 cursor-pointer" />
          <div className="hidden xl:block">Search</div>
        </div>

        <SidebarLink text="News" Icon={NewspaperIcon} IconSolid={NewspaperIconSolid} active={activeLink === 'news'} />

        {session && session.user && <SidebarLink text="Bookmarks" Icon={BookmarkIcon} IconSolid={BookmarkIconSolid} active={activeLink === 'bookmarks'} />}

        {/* Only show if the user is logged in. */}
        {session && session.user && (
          <SidebarLink text="Profile" Icon={UserIcon} IconSolid={UserIconSolid} active={activeLink === 'profile'} tag={session.user.tag} />
        )}

        {showLoginAndSignupButtons && (
          <>
            <SidebarLink text="Login" Icon={LoginIcon} IconSolid={LoginIconSolid} active={activeLink === 'login'} />
            <SidebarLink text="Signup" Icon={UserIcon} IconSolid={UserIconSolid} active={activeLink === 'signup'} />
          </>
        )}

        <SidebarLink text="Settings" Icon={CogIcon} IconSolid={CogIconSolid} active={activeLink === 'settings'} />

        <button className="hidden xl:flex justify-center items-center bg-lightblue-500 text-white rounded-full px-6 py-4 w-full font-semibold text-lg" onClick={() => {
          if (!session) {
            setAuthModalOpen(true);
            return;
          }
          setIsOpen(true);
        }}>
          Tweet
        </button>

        {/* This is for mobile which by default will show the blue feather to post a tweet. I could remove it if the user is not logged in but for the purpose of the site, I think it'd be better to leave it there and link to the auth page if the user wants to tweet. */}
        <div className="text-white bg-lightblue-400 flex justify-center items-center rounded-full p-4 xl:hidden cursor-pointer" onClick={() => {
          if (!session) {
            setAuthModalOpen(true);
            return;
          }
          setIsOpen(true);
        }}>
          <FaFeatherAlt className="h-5 w-5" />
        </div>
      </div>

      <div className="hidden sm:block">
        <ProfileButton />
      </div>
    </div>
  );
};

export default Sidebar;
