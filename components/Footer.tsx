import { CogIcon, MoonIcon, SunIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import React from 'react'
import { FaBell, FaHome, FaSearch } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { FaUser } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { colorThemeState, searchModalState, sidenavState } from '../atoms/atom'
import { useSession } from 'next-auth/react'
import { SearchModal } from './SearchModal'

const Footer = () => {

  const { data: session } = useSession()
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState)
  const [sidenavOpen, setSidenavOpen] = useRecoilState(sidenavState)

  return (
    <div className="sm:hidden fixed bottom-0 w-full border-t-[1px] bg-white border-[#AAB8C2] dark:bg-black  dark:border-gray-700 p-4 px-6 flex justify-between items-center h-[60px]">
      <Link href={`/`}>
        <FaHome className="flex-1 h-6 w-6 cursor-pointer" />
      </Link>

      <FaSearch className="flex-1 h-6 w-6 cursor-pointer" onClick={() => setSearchModalOpen(true)} />

      {theme === 'dark' ? (
        <SunIcon className="flex-1 cursor-pointer h-[30px] w-[30px] dark:text-white" onClick={() => {
          setTheme('light')
          localStorage.theme = 'light'
        }} />
      ) : (
        <MoonIcon className="flex-1 cursor-pointer h-[30px] w-[30px] dark:text-white" onClick={() => {
          setTheme('dark')
          localStorage.theme = 'dark'
        }} />
      )}

      <CogIcon className="flex-1 h-7 w-7 cursor-pointer" onClick={() => setSidenavOpen(true)} />

      {/* {session && session.user && (
        <Link href={`/profile/${session.user.tag}`}>
          <FaUser className="flex-1 h-7 w-7 cursor-pointer" />
        </Link>
      )} */}
    </div>
  )
}

export default Footer
