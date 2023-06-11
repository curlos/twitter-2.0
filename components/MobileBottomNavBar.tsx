import { CogIcon, MoonIcon, SunIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import React from 'react';
import { FaHome, FaSearch } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import { colorThemeState, searchModalState, sidenavState } from '../atoms/atom';

/**
 * @description - On mobile, the usual sidebar would not fit so instead all the items will be in a bottom NavBar with all the elements (Home button, Search button, Light/Dark mode button, etc.) from the sidebar but in a more compact version.
 * @returns {React.FC}
 */
const MobileBottomNavBar: React.FC = () => {
  const [theme, setTheme] = useRecoilState(colorThemeState);
  const [_searchModalOpen, setSearchModalOpen] = useRecoilState(searchModalState);
  const [_sidenavOpen, setSidenavOpen] = useRecoilState(sidenavState);

  return (
    <div className="sm:hidden fixed bottom-0 w-full border-t-[1px] bg-white border-[#AAB8C2] dark:bg-black  dark:border-gray-700 p-4 px-6 flex justify-between items-center h-[60px]">
      {/* Will redirect back home to the user's feed. */}
      <Link href={`/`}>
        <FaHome className="flex-1 h-6 w-6 cursor-pointer" />
      </Link>

      {/* Clicking this will open the "Search" modal where users can type in whatever they want and filter the tweets shown by their query. */}
      <FaSearch className="flex-1 h-6 w-6 cursor-pointer" onClick={() => setSearchModalOpen(true)} />

      {/* Clicking this will toggle between either 'light' mode or 'dark' mode depending on which mode you're currently on. */}
      {theme === 'dark' ? (
        <SunIcon className="flex-1 cursor-pointer h-[30px] w-[30px] dark:text-white" onClick={() => {
          setTheme('light');
          localStorage.theme = 'light';
        }} />
      ) : (
        <MoonIcon className="flex-1 cursor-pointer h-[30px] w-[30px] dark:text-white" onClick={() => {
          setTheme('dark');
          localStorage.theme = 'dark';
        }} />
      )}

      {/* This is the settings icon. When it's clicked, it will open the "Sidenav" so the user can see all the full detailed stuff that couldn't fit on this MobileBottomNavBar. */}
      <CogIcon className="flex-1 h-7 w-7 cursor-pointer" onClick={() => setSidenavOpen(true)} />
    </div>
  );
};

export default MobileBottomNavBar;
