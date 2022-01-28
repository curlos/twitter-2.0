import Link from 'next/link'
import React, { useEffect } from 'react'

interface ParentCompProps {
  childComp?: React.ReactNode;
}

interface Props {
  text: string,
  Icon: React.FC<ParentCompProps>,
  active: boolean,
  tag?: string
}

const SidebarLink = ({ text, Icon, active, tag }: Props) => {

  console.log(Icon)

  const getLinkHref = (text) => {
    switch (text) {
      case 'Profile':
        return `/profile/${tag}`
      case 'Messages':
        return `/messages`
      case 'Bookmarks':
        return `/bookmarks`
      default:
        return '/'
    }
  }

  return (
    <Link href={getLinkHref(text)}>
      <div className={`flex items-center space-x-2 text-xl cursor-pointer ${active && 'font-bold text-lightblue-500 dark:text-white'}`}>
        <Icon className="h-[30px] w-[30px]" />
        <div className="hidden xl:block">{text}</div>
      </div>
    </Link>
  )
}

export default SidebarLink
