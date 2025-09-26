import React from 'react';
import Head from 'next/head';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, editProfileModalState, sidenavState, authModalState, editInteractionSettingsModalState } from '../../atoms/atom';
import Sidebar from '../Sidebar';
import Widgets from '../Widgets';
import MobileBottomNavBar from '../MobileBottomNavBar';
import { NewTweetModal } from '../NewTweetModal';
import { SearchModal } from '../SearchModal';
import SidenavDrawer from '../SidenavDrawer';
import { AuthModal } from '../AuthModal';
import { EditInteractionSettingsModal } from '../EditInteractionSettingsModal';
import { TweetSentAlert } from '../TweetSentAlert';

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
  const [isAuthModalOpen, _setIsAuthModalOpen] = useRecoilState(authModalState);
  const [isEditInteractionSettingsModalOpen, _setIsEditInteractionSettingsModalOpen] = useRecoilState(editInteractionSettingsModalState);

  return (
    <div className={theme}>
      <div className="bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen">
        <div className={`max-w-7xl mx-auto`}>
          <Head>
            <title>{title}</title>
            <link rel="icon" href="/assets/twitter-logo.svg" />
          </Head>

          <main className={`bg-white text-black dark:bg-black dark:text-white min-h-screen flex`}>
            <Sidebar />
            <div className="flex-1">
              {children}
            </div>
            {showWidgets && <Widgets />}

            {isOpen && <NewTweetModal setIsEditing={setIsEditing} />}
            {isSearchModalOpen && <SearchModal />}
            {isSidenavOpen && <SidenavDrawer />}
            {isAuthModalOpen && <AuthModal />}
            {isEditInteractionSettingsModalOpen && <EditInteractionSettingsModal />}

            <TweetSentAlert />
            <MobileBottomNavBar />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;