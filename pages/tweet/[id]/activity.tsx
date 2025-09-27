import { DocumentData, query, collection, where, doc, getDoc, onSnapshot } from "@firebase/firestore";
import { ChatAltIcon, HeartIcon } from "@heroicons/react/solid";
import { FaRetweet } from "react-icons/fa";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import AppLayout from "../../../components/Layout/AppLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import ContentContainer from "../../../components/Layout/ContentContainer";
import Tweet from "../../../components/Tweet/Tweet";
import SortableUserList from "../../../components/SortableUserList";
import SortableTweetList from "../../../components/SortableTweetList";

/**
 * @description - Renders the Tweet Activity page showing quotes and retweets for a specific tweet
 * @returns
 */
const TweetActivity = () => {
  const [tweet, setTweet] = useState<DocumentData>();
  const [author, setAuthor] = useState<DocumentData>();
  const [quotes, setQuotes] = useState([]);
  const [retweets, setRetweets] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retweetsLoading, setRetweetsLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  const urlContainsQuotes = !router.query.retweets && !router.query.likes;
  const urlContainsRetweets = router.query.retweets === 'true';
  const urlContainsLikes = router.query.likes === 'true';

  useEffect(() => {
    let unsubscribeTweet: (() => void) | undefined;

    if (id) {
      getTweetAndActivity().then((unsubscribe) => {
        unsubscribeTweet = unsubscribe;
      });
    }

    return () => {
      if (unsubscribeTweet) {
        unsubscribeTweet();
      }
    };
  }, [id]);

  /**
   * @description - Gets the original tweet and sets up real-time listeners
   */
  const getTweetAndActivity = async () => {
    try {
      // Set up real-time listener for the original tweet
      const tweetRef = doc(db, "tweets", String(id));
      const unsubscribeTweet = onSnapshot(tweetRef, async (tweetSnapshot) => {
        if (tweetSnapshot.exists()) {
          const tweetData = tweetSnapshot.data();
          setTweet(tweetData);

          // Get the tweet author (only fetch once since user data rarely changes)
          if (!author) {
            const authorRef = doc(db, "users", tweetData.userID);
            const authorSnapshot = await getDoc(authorRef);
            setAuthor(authorSnapshot.data());
          }

          setLoading(false);
        } else {
          // Tweet doesn't exist, redirect to home
          router.push('/');
        }
      });

      // Set up real-time listeners for quotes, retweets, and likes
      setupQuotesListener();
      setupRetweetsListener();
      setupLikesListener();

      // Return cleanup function
      return unsubscribeTweet;
    } catch (error) {
      console.error('Error setting up tweet activity listeners:', error);
      setLoading(false);
    }
  };

  const setupQuotesListener = () => {
    const quotesQuery = query(
      collection(db, "tweets"),
      where("parentTweet", "==", String(id)),
      where("isQuoteTweet", "==", true)
    );

    const unsubscribe = onSnapshot(quotesQuery, (snapshot) => {
      setQuotes(snapshot.docs);
    });

    return unsubscribe;
  };

  const setupRetweetsListener = () => {
    const retweetsQuery = query(collection(db, 'tweets', String(id), 'retweets'));

    const unsubscribe = onSnapshot(retweetsQuery, async (snapshot) => {
      try {
        // Get user data for each retweet
        const retweetData = await Promise.all(
          snapshot.docs.map(async (retweetDoc) => {
            const retweetDocData = retweetDoc.data();
            const userRef = doc(db, "users", retweetDoc.id);
            const userSnapshot = await getDoc(userRef);

            return {
              id: retweetDoc.id,
              ...retweetDocData,
              userData: userSnapshot.data()
            };
          })
        );

        setRetweets(retweetData);
        setRetweetsLoading(false);
      } catch (error) {
        console.error('Error setting up retweets listener:', error);
        setRetweets([]);
        setRetweetsLoading(false);
      }
    });

    return unsubscribe;
  };

  const setupLikesListener = () => {
    const likesQuery = query(collection(db, 'tweets', String(id), 'likes'));

    const unsubscribe = onSnapshot(likesQuery, async (snapshot) => {
      try {
        // Get user data for each like
        const likeData = await Promise.all(
          snapshot.docs.map(async (likeDoc) => {
            const likeDocData = likeDoc.data();
            const userRef = doc(db, "users", likeDoc.id);
            const userSnapshot = await getDoc(userRef);

            return {
              id: likeDoc.id,
              ...likeDocData,
              userData: userSnapshot.data()
            };
          })
        );

        setLikes(likeData);
        setLikesLoading(false);
      } catch (error) {
        console.error('Error setting up likes listener:', error);
        setLikes([]);
        setLikesLoading(false);
      }
    });

    return unsubscribe;
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'quotes') {
      router.push(`/tweet/${id}/activity`, undefined, { shallow: true });
    } else if (tab === 'retweets') {
      router.push(`/tweet/${id}/activity?retweets=true`, undefined, { shallow: true });
    } else if (tab === 'likes') {
      router.push(`/tweet/${id}/activity?likes=true`, undefined, { shallow: true });
    }
  };

  return (
    <AppLayout title={`Tweet Activity`}>
      <ContentContainer loading={loading}>
        {tweet && author && (
          <>
            <PageHeader
              title="Tweet Activity"
            />

            {/* Original Tweet */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <Tweet
                id={String(id)}
                tweet={tweet}
                tweetID={String(id)}
                tweetPage={false}
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {/* QUOTES TAB */}
              <button
                onClick={() => handleTabChange('quotes')}
                className="flex flex-grow flex-col items-center text-base text-gray-500 cursor-pointer"
              >
                <div className={`${urlContainsQuotes && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-4 flex justify-center items-center gap-2`}>
                  <ChatAltIcon className="h-5 w-5" />
                  Quotes
                </div>
                {urlContainsQuotes && (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full" />
                )}
              </button>

              {/* RETWEETS TAB */}
              <button
                onClick={() => handleTabChange('retweets')}
                className="flex flex-grow flex-col items-center text-base text-gray-500 cursor-pointer"
              >
                <div className={`${urlContainsRetweets && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-4 flex justify-center items-center gap-2`}>
                  <FaRetweet className="h-5 w-5" />
                  Retweets
                </div>
                {urlContainsRetweets && (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full" />
                )}
              </button>

              {/* LIKES TAB */}
              <button
                onClick={() => handleTabChange('likes')}
                className="flex flex-grow flex-col items-center text-base text-gray-500 cursor-pointer"
              >
                <div className={`${urlContainsLikes && 'text-lightblue-500 dark:text-white font-bold'} flex-1 py-4 flex justify-center items-center gap-2`}>
                  <HeartIcon className="h-5 w-5" />
                  Likes
                </div>
                {urlContainsLikes && (
                  <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            {urlContainsQuotes ? (
              // Quotes Tab Content - Use SortableTweetList with sorting dropdown for tweets
              <SortableTweetList
                tweets={quotes}
                loading={false}
                emptyStateMessage="No quotes yet"
                emptyStateSubtitle="This tweet hasn't been quoted by anyone yet."
                emptyStateIcon={ChatAltIcon}
                itemsPerPage={10}
              />
            ) : urlContainsRetweets ? (
              // Retweets Tab Content - Reuse SortableUserList for users who retweeted
              <SortableUserList
                users={retweets.map(retweet => ({
                  id: retweet.id,
                  ...retweet,
                  ...retweet.userData
                }))}
                loading={retweetsLoading}
                emptyStateMessage="No retweets"
                emptyStateSubtitle="This tweet hasn't been retweeted by anyone yet."
                emptyStateIcon={FaRetweet}
                itemsPerPage={10}
                showFollowerSortOptions={false}
              />
            ) : urlContainsLikes ? (
              // Likes Tab Content - Use SortableUserList for users who liked
              <SortableUserList
                users={likes.map(like => ({
                  id: like.id,
                  ...like,
                  ...like.userData
                }))}
                loading={likesLoading}
                emptyStateMessage="No likes"
                emptyStateSubtitle="This tweet hasn't been liked by anyone yet."
                emptyStateIcon={HeartIcon}
                itemsPerPage={10}
                showFollowerSortOptions={false}
              />
            ) : null}
          </>
        )}
      </ContentContainer>
    </AppLayout>
  );
};

export default TweetActivity;