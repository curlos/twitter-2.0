import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HomeIcon } from "@heroicons/react/solid";
import {
  BookmarkIcon,
  UserIcon,
  DotsHorizontalIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/outline";
import SidebarLink from "./SidebarLink";
import { signOut, useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { colorThemeState, newTweetModalState, searchModalState } from "../atoms/atom";
import router, { useRouter } from "next/router";
import Link from "next/link";
import { FaFeatherAlt, FaSearch } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs"
import { SearchModal } from "./SearchModal";

const Sidebar = () => {

  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState)
  const [activeLink, setActiveLink] = useState('home')
  const router = useRouter()

  useEffect(() => {
    console.log(localStorage.getItem('theme'))
    setTheme(localStorage.getItem('theme'))
  }, [])

  useEffect(() => {
    if (router.pathname.startsWith('/bookmarks')) {
      setActiveLink('bookmarks')
    } else if (router.pathname.startsWith('/profile')) {
      setActiveLink('profile')
    } else {
      setActiveLink('home')
    }
  }, [router.pathname])

  return (
    <div className={`${theme} hidden sm:flex flex-col fixed h-full px-4 pt-4 overflow-auto scrollbar-hide border-r border-gray-400 dark:border-gray-700 w-[80px] xl:w-[280px] py-4`}>
      <div className="flex flex-col justify-start items-center xl:items-start space-y-6 flex-grow">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <BsTwitter className="h-[30px] w-[30px] text-lightblue-500 dark:text-white" />
        </div>

        {theme === 'dark' ? (
          <div className="cursor-pointer" onClick={() => {
            setTheme('light')
            localStorage.theme = 'light'
          }}>
            <SunIcon className="h-[30px] w-[30px] dark:text-white" />
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => {
            setTheme('dark')
            localStorage.theme = 'dark'
          }}>
            <MoonIcon className="h-[30px] w-[30px] dark:text-white" />
          </div>
        )}

        <SidebarLink text="Home" Icon={HomeIcon} active={activeLink === 'home'} />
        <FaSearch className="h-6 w-6 cursor-pointer" onClick={() => setSearchModalOpen(true)} />
        <SidebarLink text="Bookmarks" Icon={BookmarkIcon} active={activeLink === 'bookmarks'} />
        {/* <SidebarLink text="Lists" Icon={UserIcon} active={false} /> */}

        {session && session.user && (
          <SidebarLink text="Profile" Icon={UserIcon} active={activeLink === 'profile'} tag={session.user.tag} />
        )}

        {/* <SidebarLink text="More" Icon={DotsHorizontalIcon} active={false} /> */}

        {session && session.user && (
          <div className={`flex items-center space-x-2 text-xl cursor-pointer`} onClick={() => {
            signOut({ callbackUrl: 'http://localhost:3000/auth' })
          }}>
            <LogoutIcon className="h-[30px] w-[30px]" />
            <div className="hidden xl:block">Logout</div>
          </div>
        )}

        <button className="hidden xl:flex justify-center items-center bg-lightblue-500 text-white rounded-full px-6 py-4 w-full font-semibold text-lg" onClick={() => setIsOpen(true)}>
          Tweet
        </button>

        <div className="text-white bg-lightblue-400 flex justify-center items-center rounded-full p-4 xl:hidden" onClick={() => session && setIsOpen(true)}>
          <FaFeatherAlt className="h-5 w-5 cursor-pointer" />
        </div>
      </div>

      {session && session.user && (
        <div className="hidden xl:flex items-center justify-between mt-3 w-100">
          <div className="flex items-center space-x-2 w-100">
            <Link href={`/profile/${session.user.tag}`}>
              <img src={session.user.profilePic} alt={session.user.name} className="rounded-full w-[55px] h-[55px] bg-red-500 object-cover cursor-pointer" />
            </Link>

            <div className="flex flex-col w-100">
              <Link href={`/profile/${session.user.tag}`}>
                <div className="cursor-pointer hover:underline">{session.user.name}</div>
              </Link>
              <div className="text-gray-500 break-word">@{session.user.tag}</div>
            </div>
          </div>

          <div>
            <DotsHorizontalIcon className="h-6 w-6" />
          </div>

        </div>
      )}
    </div>
  )
}

export default Sidebar
