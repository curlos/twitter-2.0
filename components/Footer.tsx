import Link from 'next/link'
import React from 'react'
import { FaBell, FaHome, FaSearch } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { HiMail } from 'react-icons/hi'

const Footer = () => {
  return (
    <div className="lg:hidden fixed bottom-0 w-full bg-black p-4 px-6 flex justify-between items-center">
      <Link href={`/`}>
        <FaHome className="flex-1 h-6 w-6 cursor-pointer" />
      </Link>

      <Link href={`/`}>
        <FaSearch className="flex-1 h-6 w-6 cursor-pointer" />
      </Link>

      <Link href={`/`}>
        <FaBell className="flex-1 h-6 w-6 cursor-pointer" />
      </Link>

      <Link href={`/`}>
        <HiMail className="flex-1 h-7 w-7 cursor-pointer" />
      </Link>


    </div>
  )
}

export default Footer
