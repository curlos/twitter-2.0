import { collection, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, sidenavState } from '../atoms/atom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import MobileBottomNavBar from '../components/MobileBottomNavBar';
import { NewTweetModal } from '../components/NewTweetModal';
import { SearchModal } from '../components/SearchModal';
import Sidebar from '../components/Sidebar';
import SidenavDrawer from '../components/SidenavDrawer';
import Spinner from '../components/Spinner';
import TweetWithID from '../components/TweetWithID';
import Widgets from '../components/Widgets';
import { db } from '../firebase';

const Followers = () => {
  useAuthRedirect(); // Just handle the redirect, don't block rendering
  const { data: session } = useSession();
  const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.uid) return;

    const unsubscribe = onSnapshot(collection(db, 'users', session.user.uid, 'bookmarks'), (snapshot) => {
      setTweets(snapshot.docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db, loading, session]);


  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          Bookmarks / Twitter 2.0
        </title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen px-0 lg:px-36 xl:px-48 2xl:px-12 flex`}>
        <Sidebar />
        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2] dark:border-gray-700">
          {!loading ? (
            <div>
              <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white text-black dark:bg-black dark:text-white sticky top-0">
                <div className="">
                  <div className="flex items-center mb-0 p-0">
                    <h2 className="font-bold text-xl">Bookmarks</h2>
                  </div>

                  <div className="text-gray-400 text-sm">@{session.user.tag}</div>
                </div>
              </div>

              <div>
                {tweets.map((tweet) => (
                  <TweetWithID key={tweet.data().tweetID} tweetID={tweet.data().tweetID} />
                ))}
              </div>

              <div className="h-[60px]" />
            </div>
          ) : <div className="pt-5"><Spinner /></div>
          }
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

export default Followers;
