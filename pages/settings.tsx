import { useSession } from 'next-auth/react';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, sidenavState } from '../atoms/atom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import MobileBottomNavBar from '../components/MobileBottomNavBar';
import { NewTweetModal } from '../components/NewTweetModal';
import { SearchModal } from '../components/SearchModal';
import Sidebar from '../components/Sidebar';
import SidenavDrawer from '../components/SidenavDrawer';
import Widgets from '../components/Widgets';
import { SunIcon, MoonIcon } from '@heroicons/react/outline';

const Settings = () => {
  useAuthRedirect();
  const { data: session } = useSession();
  const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, setTheme] = useRecoilState(colorThemeState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);

  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          Settings / Twitter 2.0
        </title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen px-0 lg:px-36 xl:px-48 2xl:px-12 flex`}>
        <Sidebar />
        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2] dark:border-gray-700">
          <div>
            <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white text-black dark:bg-black dark:text-white sticky top-0">
              <div className="">
                <div className="flex items-center mb-0 p-0">
                  <h2 className="font-bold text-xl">Settings</h2>
                </div>
                {session?.user && (
                  <div className="text-gray-400 text-sm">@{session.user.tag}</div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Display</h3>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setTheme('light');
                        localStorage.theme = 'light';
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        theme === 'light'
                          ? 'bg-lightblue-500 text-white border-lightblue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SunIcon className="h-4 w-4" />
                      <span>Light</span>
                    </button>

                    <button
                      onClick={() => {
                        setTheme('dark');
                        localStorage.theme = 'dark';
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-lightblue-500 text-white border-lightblue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MoonIcon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[60px]" />
          </div>
        </div>

        <Widgets />
        {isOpen && <NewTweetModal />}
        {isSearchModalOpen && <SearchModal />}
        {isSidenavOpen && <SidenavDrawer />}

        <MobileBottomNavBar />
      </main>
    </div>
  );
};

export default Settings;