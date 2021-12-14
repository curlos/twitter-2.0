import { route } from 'next/dist/server/router'
import { useRouter } from 'next/router'
import React from 'react'

interface Props {
  text: string,
  Icon: any,
  active: boolean
}

const SidebarLink = ({ text, Icon, active }: Props) => {
  const router = useRouter()

  return (
    <div className={`flex items-center space-x-2 text-xl cursor-pointer ${active && 'font-bold'}`} onClick={() => router.push('/')}>
      <Icon className="h-[30px] w-[30px]" />
      <div>{text}</div>
    </div>
  )
}

export default SidebarLink
