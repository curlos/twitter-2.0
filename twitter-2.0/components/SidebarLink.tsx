import React from 'react'

interface Props {
  text: string,
  Icon: any,
  active: boolean
}

const SidebarLink = ({ text, Icon, active }: Props) => {
  return (
    <div className={`flex items-center space-x-2 text-xl ${active && 'font-bold'}`}>
      <Icon className="h-[30px] w-[30px]" />
      <div>{text}</div>
    </div>
  )
}

export default SidebarLink
