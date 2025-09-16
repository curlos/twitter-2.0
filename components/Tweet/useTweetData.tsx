import { DocumentData, onSnapshot, collection, doc, getDoc } from "@firebase/firestore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { IAuthor } from "../../utils/types";

/**
 * Custom hook to manage tweet data and related state
 */
const useTweetData = (id: string, tweet: any, tweetID: string) => {
  const { data: session } = useSession();
  const [likes, setLikes] = useState([]);
  const [retweets, setRetweets] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [replies, setReplies] = useState([]);
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [parentTweet, setParentTweet] = useState<DocumentData>();
  const [parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>();
  const [authorId, setAuthorId] = useState<string>();
  const [author, setAuthor] = useState<IAuthor>();
  const [retweetedBy, setRetweetedBy] = useState<DocumentData>();
  const [loading, setLoading] = useState(true);

  // Get REPLIES
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tweets', String(tweetID), 'replies'),
      (snapshot) => setReplies(snapshot.docs));
    return () => unsubscribe();
  }, [tweetID]);

  // Get LIKES
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tweets', tweetID, 'likes'), (snapshot) => setLikes(snapshot.docs));
    return () => unsubscribe();
  }, [id, tweetID]);

  // Get RETWEETS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tweets', tweetID, 'retweets'), (snapshot) => setRetweets(snapshot.docs));
    return () => unsubscribe();
  }, [id, tweetID]);

  // Get BOOKMARKS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tweets', tweetID, 'bookmarks'), (snapshot) => setBookmarks(snapshot.docs));
    return () => unsubscribe();
  }, [id, tweetID]);

  // Check if the logged in user (if any) has liked this tweet
  useEffect(() => {
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1);
  }, [likes, session?.user.uid]);

  // Check if the logged in user (if any) has retweeted this tweet
  useEffect(() => {
    setRetweeted(retweets.findIndex((retweet) => retweet.id === session?.user.uid) !== -1);
  }, [retweets, session?.user.uid]);

  // Check if the logged in user (if any) has bookmarked this tweet
  useEffect(() => {
    setBookmarked(bookmarks.findIndex((bookmark) => bookmark.id === session?.user.uid) !== -1);
  }, [bookmarks, session?.user.uid]);

  // Get the author of the tweet
  useEffect(() => {
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
  }, [id, tweet.userID]);

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
  }, [id, tweet.parentTweet]);

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
  }, [id, parentTweet]);

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
    likes,
    retweets,
    bookmarks,
    replies,
    liked,
    retweeted,
    bookmarked,
    parentTweet,
    parentTweetAuthor,
    authorId,
    author,
    retweetedBy,
    loading
  };
};

export default useTweetData