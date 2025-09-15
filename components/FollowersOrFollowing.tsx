import { DocumentData, query, collection, where, getDocs } from "@firebase/firestore";
import { ArrowLeftIcon, BadgeCheckIcon, UserGroupIcon } from "@heroicons/react/solid";
import Head from "next/head";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { newTweetModalState, colorThemeState, searchModalState } from "../atoms/atom";
import { db } from "../firebase";
import MediumUser from "./MediumUser";
import MobileBottomNavBar from "./MobileBottomNavBar";
import { NewTweetModal } from "./NewTweetModal";
import { SearchModal } from "./SearchModal";
import Sidebar from "./Sidebar";
import Spinner from "./Spinner";
import Widgets from "./Widgets";

/**
 * @description - Renders the content for either the "/followers/${tag}" OR "/following/${tag}" pages.
 * @returns 
 */
const FollowersOrFollowing = () => {
  const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [author, setAuthor] = useState<DocumentData>();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { tag } = router.query;

  const urlContainsFollowers = router.pathname.includes('followers');
  const urlContainsFollowing = router.pathname.includes('following');

  useEffect(() => {
    getAccounts();
  }, [db, tag, loading]);

  /**
   * @description - Gets the accounts that are either FOLLOWERS or FOLLOWING (depending on the URL) of the user whose username (or tag) matches the one in the URL.
   */
  const getAccounts = async () => {
    // Finds the user whose tag is equal to the tag from the URL.
    const q = query(collection(db, "users"), where('tag', '==', String(tag)));
    const querySnapshot = await getDocs(q);
    const userID = querySnapshot.docs[0].id;
    setAuthor(querySnapshot.docs[0].data());

    let queryAccounts = null;

    if (urlContainsFollowers) {
      // Using the ID of the user, get their followers by going into the "followers" subcollection.
      queryAccounts = query(collection(db, "users", userID, "followers"));
    } else if (urlContainsFollowing) {
      queryAccounts = query(collection(db, "users", userID, "following"));
    }

    const queryFollowersSnapshot = await getDocs(queryAccounts);
    setAccounts(queryFollowersSnapshot.docs);
    setLoading(false);
  };

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          {`${tag}'s`} Followers
        </title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`bg-white text-black dark:bg-black dark:text-white px-0 lg:px-36 xl:px-48 2xl:px-12 min-h-screen flex  `}>
        <Sidebar />

        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2]  dark:border-gray-700">
          {!loading && author ? (
            <div>
              {/* Displays the "name" and "username" about the user who's followers we are looking at. */}
              <div className="flex items-center space-x-4 border-b border-[#AAB8C2]  dark:border-gray-700 p-2 sticky top-0">
                <div className="cursor-pointer mx-3" onClick={() => router.push(`/profile/${author.tag}`)}>
                  <ArrowLeftIcon className="h-6 w-6" />
                </div>
                <div className="">
                  <div className="flex items-center mb-0 p-0">
                    <h2 className="font-bold">{author.name}</h2>
                    <BadgeCheckIcon className="h-6 w-6 text-lightblue-500" />
                  </div>

                  <div className="text-gray-400 text-sm">@{author.tag}</div>
                </div>
              </div>

              {/* Can switch between the two URLs below:
                  - "/following/${tag}": Shows the people that user is following.
                  - "followers/${tag}": Shows the people that user is followed by.
              */}
              <div className="flex">
                {/* FOLLOWERS TAB */}
                <Link href={`/followers/${author.tag}`}>
                  <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer">
                    <div className={`${router.asPath.includes('followers') && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Followers</div>

                    {router.asPath.includes('followers') ? (
                      <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                      />
                    ) : null}
                  </div>
                </Link>

                {/* FOLLOWING TAB */}
                <Link href={`/following/${author.tag}`}>
                  <div className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 cursor-pointer">
                    <div className={`${router.asPath.includes('following') && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>Following</div>

                    {router.asPath.includes('following') ? (
                      <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full"
                      />
                    ) : null}
                  </div>
                </Link>
              </div>

              {/* Go through the list of the user's "followers" and render them. This will show basic information about each user (profile pic, name, username, bio) and a button that allows the user to quickly click "follow" to follow or unfollow them.  */}
              <div>
                {accounts.length > 0 ? (
                  accounts.map((account) => {
                    let key = null;
                    let userID = null;

                    key = userID = account.id;

                    return (
                      <MediumUser key={key} userID={userID} />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <UserGroupIcon className="h-16 w-16 mb-4 text-gray-400" />
                    {urlContainsFollowers ? (
                      <p className="text-xl">No followers</p>
                    ) : (
                      <p className="text-xl">Not following anyone</p>
                    )}
                  </div>
                )}

                <div className="h-[60px]" />
              </div>
            </div>
          ) : <div className="pt-5"><Spinner /></div>
          }
        </div>

        <Widgets />

        {isOpen && <NewTweetModal />}
        {isSearchModalOpen && <SearchModal />}

        <MobileBottomNavBar />

      </main>
    </div>
  );
};

export default FollowersOrFollowing;