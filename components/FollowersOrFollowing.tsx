import { DocumentData, query, collection, where, getDocs, doc, getDoc } from "firebase/firestore";
import { UserGroupIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import AppLayout from "./Layout/AppLayout";
import PageHeader from "./Layout/PageHeader";
import ContentContainer from "./Layout/ContentContainer";
import SortableUserList from "./SortableUserList";
import { HiBadgeCheck } from "react-icons/hi";

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
    try {
      // Finds the user whose tag is equal to the tag from the URL.
      const q = query(collection(db, "users"), where('tag', '==', String(tag)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length === 0) {
        // No user found with this tag, redirect to home
        setLoading(false);
        router.push('/');
        return;
      }

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

    // Fetch user data for each follower/following for sorting purposes
    const accountsWithUserData = await Promise.all(
      queryFollowersSnapshot.docs.map(async (accountDoc) => {
        const userRef = doc(db, "users", accountDoc.id);
        const userSnapshot = await getDoc(userRef);

        const accountData = accountDoc.data() as any;
        return {
          id: accountDoc.id,
          ...(accountData || {}), // follower document data (includes followedAt)
          userData: userSnapshot.data() // actual user data (includes followersCount, followingCount)
        };
      })
    );

    setAccounts(accountsWithUserData);
    setLoading(false);
    } catch (error) {
      console.error('Error fetching followers/following:', error);
      setLoading(false);
      // On error, also redirect to home page
      router.push('/');
    }
  };

  return (
    <AppLayout title={`${tag}'s Followers`}>
      <ContentContainer loading={loading || !author}>
        {author && (
          <>
            <PageHeader
              title={
                <div className="flex items-center">
                  <h2 className="text-xl font-[900] truncate max-w-[250px] sm:max-w-[550px] lg:max-w-[420px] xl:max-w-[480px]">{author.name}</h2>
                  <HiBadgeCheck className="h-6 w-6 text-lightblue-500 ml-1" />
                </div>
              }
              subtitle={`@${author.tag}`}
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
            <SortableUserList
              users={accounts}
              loading={loading}
              emptyStateMessage={urlContainsFollowers ? "No followers" : "Not following anyone"}
              emptyStateSubtitle={urlContainsFollowers ? "This user has no followers yet." : "This user isn't following anyone yet."}
              emptyStateIcon={UserGroupIcon}
              itemsPerPage={10}
              showFollowerSortOptions={true}
            />
          </>
        )}
      </ContentContainer>
    </AppLayout>
  );
};

export default FollowersOrFollowing;