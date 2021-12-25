import Link from 'next/link'
import React from 'react'

interface Props {
  text: string,
  Icon: any,
  active: boolean,
  tag?: string
}

const SidebarLink = ({ text, Icon, active, tag }: Props) => {
  return (
    <Link href={text === 'Profile' ? `/profile/${tag}` : '/'}>
      <div className={`flex items-center space-x-2 text-xl cursor-pointer ${active && 'font-bold'}`}>
        <Icon className="h-[30px] w-[30px]" />
        <div>{text}</div>
      </div>
    </Link>
  )
}

export default SidebarLink
