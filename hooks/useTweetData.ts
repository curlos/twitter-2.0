import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, DocumentData, onSnapshot, getDoc, collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const useTweetData = (isEditing?: boolean, getReplies: boolean = true) => {
  const [tweet, setTweet] = useState<DocumentData>();
  const [tweetID, setTweetID] = useState('');
  const [author, setAuthor] = useState<DocumentData>();
  const [replies, setReplies] = useState([]);
  const [parentTweet, setParentTweet] = useState<DocumentData>();
  const [parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>();
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  // Effect hook for loading the main tweet data
  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "tweets", String(id)), (snapshot) => {
      // Skip updates when editing to prevent component unmounting
      if (!isEditing) {
        setTweet(snapshot.data());
        setTweetID(snapshot.id);
      }
    });
    return () => unsubscribe();
  }, [db, id, isEditing]);

  // Effect hook for loading the replies to the main tweet
  useEffect(() => {
    if (!id || !getReplies) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "tweets"),
        where("parentTweet", "==", id),
        orderBy("timestamp", "desc"),
      ),
      (snapshot) => {
        const filteredReplies = snapshot.docs.filter(doc => !doc.data().isQuoteTweet);
        setReplies(filteredReplies);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db, id, getReplies]);

  // Effect hook for loading the author of the main tweet
  useEffect(() => {
    let isMounted = true;
    if (tweet?.userID) {
      setLoading(true);
      const docRef = doc(db, "users", tweet.userID);
      getDoc(docRef).then((snap) => {
        if (isMounted) {
          setAuthor(snap.data());
          setLoading(false);
          setParentTweet(null);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [tweet?.userID]);

  // Effect hook for loading the parent tweet, if any
  useEffect(() => {
    if (tweet?.parentTweet && tweet.parentTweet !== "") {
      const unsubscribe = onSnapshot(doc(db, "tweets", String(tweet.parentTweet)), (snap) => {
        setParentTweet(snap);
      });
      return () => unsubscribe();
    } else {
      setParentTweet(null);
    }
  }, [tweet?.parentTweet]);

  // Effect hook for loading the author of the parent tweet
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
  }, [db, id, parentTweet]);

  return {
    tweet,
    tweetID,
    author,
    replies,
    parentTweet,
    parentTweetAuthor,
    loading,
    isQuoteTweet: tweet?.isQuoteTweet
  };
};