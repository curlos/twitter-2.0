import { DocumentData, onSnapshot, collection, doc, getDoc } from "@firebase/firestore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { IAuthor } from "../../utils/types";

/**
 * Custom hook to manage tweet data and related state
 * Now optimized to use count properties instead of fetching full subcollections
 */
const useTweetData = (_id: string, tweet: any, tweetID: string, isDetailPage = false) => {
  const { data: session } = useSession();

  // Count properties from tweet document (efficient)
  const likesCount = tweet?.likesCount || 0;
  const retweetsCount = tweet?.retweetsCount || 0;
  const bookmarksCount = tweet?.bookmarksCount || 0;
  const repliesCount = tweet?.repliesCount || 0;

  // User interaction states
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Only fetch replies for detail pages (where we need to show the list)
  const [replies, setReplies] = useState([]);
  const [parentTweet, setParentTweet] = useState<DocumentData>();
  const [parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>();
  const [authorId, setAuthorId] = useState<string>();
  const [author, setAuthor] = useState<IAuthor>();
  const [retweetedBy, setRetweetedBy] = useState<DocumentData>();
  const [loading, setLoading] = useState(true);

  // Only fetch replies for detail pages (where we need to show the list)
  useEffect(() => {
    if (isDetailPage) {
      const unsubscribe = onSnapshot(
        collection(db, 'tweets', String(tweetID), 'replies'),
        (snapshot) => setReplies(snapshot.docs));
      return () => unsubscribe();
    }
  }, [tweetID, isDetailPage]);

  // Check user interaction status (efficient single document checks)
  useEffect(() => {
    if (!session?.user?.uid || !tweetID) return;

    const checkUserInteractions = async () => {
      try {
        // Check all user interactions in parallel
        const [likeDoc, retweetDoc, bookmarkDoc] = await Promise.all([
          getDoc(doc(db, 'tweets', tweetID, 'likes', session.user.uid)),
          getDoc(doc(db, 'tweets', tweetID, 'retweets', session.user.uid)),
          getDoc(doc(db, 'tweets', tweetID, 'bookmarks', session.user.uid))
        ]);

        setLiked(likeDoc.exists());
        setRetweeted(retweetDoc.exists());
        setBookmarked(bookmarkDoc.exists());
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    checkUserInteractions();
  }, [session?.user?.uid, tweetID]);

  // Get the author of the tweet
  useEffect(() => {
    if (!tweet.userID) return;

    let isMounted = true;
    const docRef = doc(db, "users", tweet.userID);
    getDoc(docRef).then((snap) => {
      if (isMounted) {
        setAuthorId(snap.id);
        setAuthor(snap.data() as IAuthor);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [tweet.userID]);

  // Get the PARENT tweet (Only if the current tweet is a reply to another tweet, the parent tweet)
  useEffect(() => {
    let isMounted = true;
    if (tweet.parentTweet && tweet.parentTweet !== "") {
      const docRef = doc(db, "tweets", String(tweet.parentTweet));
      getDoc(docRef).then((snap) => {
        if (isMounted) {
          setParentTweet(snap);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [tweet.parentTweet]);

  // Get the AUTHOR of the PARENT TWEET (IF it exists AND the current tweet is a REPLY)
  useEffect(() => {
    let isMounted = true;
    if (parentTweet && parentTweet.data()) {
      const docRef = doc(db, "users", String(parentTweet.data().userID));
      getDoc(docRef).then((snap) => {
        if (isMounted) {
          setParentTweetAuthor(snap.data());
          setLoading(false);
        }
      });
    } else {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [parentTweet]);

  // Get retweeted by user info
  useEffect(() => {
    let isMounted = true;
    if (tweet.retweetedBy) {
      const docRef = doc(db, "users", tweet.retweetedBy);
      getDoc(docRef).then((snap) => {
        if (isMounted) {
          setRetweetedBy(snap.data());
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [tweet.retweetedBy]);

  return {
    // Count properties (efficient)
    likesCount,
    retweetsCount,
    bookmarksCount,
    repliesCount,
    // User interaction states
    liked,
    retweeted,
    bookmarked,
    // State setters for immediate UI updates
    setLiked,
    setRetweeted,
    setBookmarked,
    // Reply documents (only for detail pages)
    replies,
    // Other tweet data
    parentTweet,
    parentTweetAuthor,
    authorId,
    author,
    retweetedBy,
    loading,
    isQuoteTweet: tweet?.isQuoteTweet
  };
};

export default useTweetData