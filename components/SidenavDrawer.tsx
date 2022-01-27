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
import { FaFeatherAlt, FaSearch } from "react-icons/fa";
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
    <div className={`${theme} ${!isOpen ? 'hidden' : ''} fixed z-50 w-screen h-screen bg-blue-500 bg-opacity-40"`}>
      <aside className={`transform z-50 top-0 right-0 bg-white text-black dark:bg-black dark:text-white fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${isOpen ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`}>
        <div className="p-10 text-2xl font-medium flex flex-col justify-between h-screen">
          hello wrodl

        </div>

      </aside>
    </div>
  )
}

export default SidenavDrawer;
