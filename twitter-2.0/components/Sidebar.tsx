import React from "react";
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
} from "@heroicons/react/outline";
import SidebarLink from "./SidebarLink";

const Sidebar = () => {
  return (
    <div className="flex flex-col fixed h-full px-4 pt-4 overflow-auto scrollbar-hide border-r border-gray-500 lg:w-[280px]">
      <div className="space-y-6 flex-grow">
        <div className="">
          <Image src="https://rb.gy/ogau5a" width={30} height={30} />
        </div>
        <SidebarLink text="Home" Icon={HomeIcon} active={true} />
        <SidebarLink text="Explore" Icon={HashtagIcon} active={false} />
        <SidebarLink text="Notifications" Icon={BellIcon} active={false} />
        <SidebarLink text="Messages" Icon={BookmarkIcon} active={false} />
        <SidebarLink text="Bookmarks" Icon={ClipboardListIcon} active={false} />
        <SidebarLink text="Lists" Icon={UserIcon} active={false} />
        <SidebarLink text="Profile" Icon={DotsCircleHorizontalIcon} active={false} />
        <SidebarLink text="More" Icon={DotsHorizontalIcon} active={false} />

        <button className="flex justify-center items-center bg-lightblue-500 rounded-full px-6 py-4 w-full">
          Tweet
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <div>
            <Image src="/assets/icon.jpg" width={50} height={50} className="rounded-full" />
          </div>

          <div className="">
            <div>firebase 1875</div>
            <div className="text-gray-500">@firebase1875</div>
          </div>
        </div>

        <div>
          <DotsHorizontalIcon className="h-6 w-6" />
        </div>

      </div>
    </div>
  )
}

export default Sidebar
