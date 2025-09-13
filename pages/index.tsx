import { getProviders, getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Router from 'next/router';
import { FaFeatherAlt } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, editProfileModalState, sidenavState } from '../atoms/atom';
import Feed from '../components/Feed';
import MobileBottomNavBar from '../components/MobileBottomNavBar';
import { NewTweetModal } from '../components/NewTweetModal';
import { SearchModal } from '../components/SearchModal';
import EditProfileModal from '../components/EditProfileModal';
import Sidebar from '../components/Sidebar';
import SidenavDrawer from '../components/SidenavDrawer';
import Widgets from '../components/Widgets';


export default function Home({ trendingResults, followResults, providers }) {
  const { data: session } = useSession();
  const [isNewTweetModalOpen, setIsNewTweetModalOpen] = useRecoilState(newTweetModalState);
  const [isSettingsModalOpen, _setSettingsModalOpen] = useRecoilState(editProfileModalState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>Twitter 2.0</title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white px-0 lg:px-36 xl:px-48 2xl:px-12 min-h-screen min-w-screen flex`}>
        <Sidebar />
        <Feed />
        <Widgets />

        {isNewTweetModalOpen && <NewTweetModal />}
        {isSettingsModalOpen && <EditProfileModal />}
        {isSearchModalOpen && <SearchModal />}
        {isSidenavOpen && <SidenavDrawer />}

        <div className="sm:hidden text-black dark:text-white  bg-lightblue-400 flex justify-center items-center rounded-full p-4 fixed bottom-0 right-0 mr-4 mb-16 cursor-pointer" onClick={() => {
          if (!session) {
            Router.push('/auth');
            return;
          }
          setIsNewTweetModalOpen(true);
        }}>
          <FaFeatherAlt className="h-7 w-7 text-white" />
        </div>

        <MobileBottomNavBar />
      </main>

    </div>
  );
}

export const getServerSideProps = async (context) => {
  const trendingResults = await fetch("https://www.jsonkeeper.com/b/NKEV").then((res) => res.json());

  const followResults = await fetch("https://www.jsonkeeper.com/b/WWMJ").then((res) => res.json());

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session
    }
  };
};
