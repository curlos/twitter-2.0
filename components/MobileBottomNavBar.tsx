import { CogIcon, NewspaperIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import React from 'react';
import { FaHome, FaSearch } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import { searchModalState, sidenavState } from '../atoms/atom';

/**
 * @description - On mobile, the usual sidebar would not fit so instead all the items will be in a bottom NavBar with all the elements (Home button, Search button, Light/Dark mode button, etc.) from the sidebar but in a more compact version.
 * @returns {React.FC}
 */
const MobileBottomNavBar: React.FC = () => {
  const [_searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState);
  const [_sidenavOpen, setSidenavOpen] = useRecoilState(sidenavState);

  return (
    <div className="sm:hidden fixed bottom-0 w-full border-t-[1px] bg-white border-[#AAB8C2] dark:bg-black  dark:border-gray-700 p-4 px-6 flex items-center h-[60px]">
      {/* Will redirect back home to the user's feed. */}
      <div className="flex-1 flex justify-center">
        <Link href={`/`}>
          <span>
            <FaHome className="h-6 w-6 cursor-pointer" />
          </span>
        </Link>
      </div>

      {/* Clicking this will open the "Search" modal where users can type in whatever they want and filter the tweets shown by their query. */}
      <div className="flex-1 flex justify-center">
        <FaSearch className="h-6 w-6 cursor-pointer" onClick={() => setSearchModalOpen(true)} />
      </div>

      {/* Will redirect to the news page. */}
      <div className="flex-1 flex justify-center">
        <Link href={`/news`}>
          <span>
            <NewspaperIcon className="h-6 w-6 cursor-pointer" />
          </span>
        </Link>
      </div>

      {/* This is the settings icon. When it's clicked, it will open the "Sidenav" so the user can see all the full detailed stuff that couldn't fit on this MobileBottomNavBar. */}
      <div className="flex-1 flex justify-center">
        <CogIcon className="h-7 w-7 cursor-pointer" onClick={() => setSidenavOpen(true)} />
      </div>
    </div>
  );
};

export default MobileBottomNavBar;
