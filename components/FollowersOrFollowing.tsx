import { DocumentData, query, collection, where, getDocs } from "@firebase/firestore";
import { BadgeCheckIcon, UserGroupIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import AppLayout from "./Layout/AppLayout";
import PageHeader from "./Layout/PageHeader";
import ContentContainer from "./Layout/ContentContainer";
import MediumUser from "./MediumUser";
import InfiniteScroll from "./InfiniteScroll";

/**
 * @description - Renders the content for either the "/followers/${tag}" OR "/following/${tag}" pages.
 * @returns
 */
const FollowersOrFollowing = () => {
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
    <AppLayout title={`${tag}'s Followers`}>
      <ContentContainer loading={loading}>
        {author && (
          <>
            <PageHeader
              title={
                <div className="flex items-center">
                  {author.name}
                  <BadgeCheckIcon className="h-6 w-6 text-lightblue-500 ml-1" />
                </div>
              }
              subtitle={`@${author.tag}`}
              showBackButton={true}
              backPath={`/profile/${author.tag}`}
            />

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
            {accounts.length > 0 ? (
              <InfiniteScroll
                items={accounts}
                renderItem={(account) => {
                  const key = account.id;
                  const userID = account.id;

                  return (
                    <MediumUser key={key} userID={userID} />
                  );
                }}
                itemsPerPage={10}
                loading={loading}
              />
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
          </>
        )}
      </ContentContainer>
    </AppLayout>
  );
};

export default FollowersOrFollowing;