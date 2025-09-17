import React from 'react';
import Head from 'next/head';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, editProfileModalState, sidenavState } from '../../atoms/atom';
import Sidebar from '../Sidebar';
import Widgets from '../Widgets';
import MobileBottomNavBar from '../MobileBottomNavBar';
import { NewTweetModal } from '../NewTweetModal';
import { SearchModal } from '../SearchModal';
import EditProfileModal from '../EditProfileModal';
import SidenavDrawer from '../SidenavDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showWidgets?: boolean;
  setIsEditing?: (editing: boolean) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = 'Twitter 2.0',
  showWidgets = true,
  setIsEditing
}) => {
  const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen px-0 lg:px-36 xl:px-48 2xl:px-12 flex`}>
        <Sidebar />
        {children}
        {showWidgets && <Widgets />}

        {isOpen && <NewTweetModal setIsEditing={setIsEditing} />}
        {isSearchModalOpen && <SearchModal />}
        {isSidenavOpen && <SidenavDrawer />}

        <MobileBottomNavBar />
      </main>
    </div>
  );
};

export default AppLayout;