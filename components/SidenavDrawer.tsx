import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HomeIcon } from "@heroicons/react/solid";
import {
  HashtagIcon,
  BellIcon,
  InboxIcon,
  BookmarkIcon,
  ClipboardListIcon,
  UserIcon,
  DotsCircleHorizontalIcon,
  DotsHorizontalIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/outline";
import SidebarLink from "./SidebarLink";
import { signOut, useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { sidenavState, colorThemeState } from "../atoms/atom";
import router, { useRouter } from "next/router";
import Link from "next/link";
import { FaFeatherAlt, FaSearch, FaHome } from "react-icons/fa";

import { FiBookmark } from 'react-icons/fi'
import { BsTwitter } from "react-icons/bs"
import { SearchModal } from "./SearchModal";

const SidenavDrawer = () => {

  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(sidenavState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
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
    <div className={`${theme} ${!isOpen ? 'hidden' : ''} fixed z-50 w-screen max-w-full h-screen bg-gray-500 bg-opacity-40`} onClick={() => setIsOpen(false)}>
      <aside className={`transform z-50 top-0 right-0 bg-white text-black dark:bg-black dark:text-white fixed h-full ease-in-out transition-all duration-1000 ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-10/12 xl:w-10/12`} onClick={(e) => e.stopPropagation()}>
        <div className="p-10 text-2xl font-medium flex flex-col justify-between h-screen">
          <div className="space-y-2">
            <Link href="/">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsOpen(false)}>
                <FaHome className="h-7 w-7" />
                Home
              </div>
            </Link>

            {theme === 'dark' ? (
              <div className="cursor-pointer flex gap-4" onClick={() => {
                setTheme('light')
                localStorage.theme = 'light'
              }}>
                <SunIcon className="h-7 w-7 dark:text-white" />
                <div>Light Mode</div>
              </div>
            ) : (
              <div className="cursor-pointer flex gap-4" onClick={() => {
                setTheme('dark')
                localStorage.theme = 'dark'
              }}>
                <MoonIcon className="h-[30px] w-[30px] dark:text-white" />
                <div>Dark Mode</div>
              </div>
            )}

            <Link href="/bookmarks">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsOpen(false)}>
                <FiBookmark className="h-7 w-7" />
                Bookmarks
              </div>
            </Link>



            {session && session.user && (
              <Link href={`/profile/${session.user.tag}`}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsOpen(false)}>
                  <UserIcon className="h-7 w-7" />
                  Profile
                </div>
              </Link>
            )}

            {session && session.user && (
              <div className={`flex items-center gap-4 cursor-pointer`} onClick={() => {
                signOut({ callbackUrl: 'http://localhost:3000/auth' })
                setIsOpen(false)
              }}>
                <LogoutIcon className="h-[30px] w-[30px]" />
                <div className="text-black dark:text-white">Logout</div>
              </div>
            )}
          </div>

          {session && session.user && (
            <div className="flex items-center justify-between mt-3 w-100 text-xl" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-4 w-100">
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

      </aside>
    </div>
  )
}

export default SidenavDrawer;
