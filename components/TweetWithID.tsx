import { doc, DocumentData, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import TweetSkeletonLoader from './TweetSkeletonLoader';
import Tweet from './Tweet';

interface Props {
  tweetID: string;
}

/**
 * @description - Renders a Tweet with a specific id (tweetID) given.
 * @returns {React.FC}
 */
const TweetWithID = ({ tweetID }: Props) => {

  const [tweet, setTweet] = useState<DocumentData>();
  const [loading, setLoading] = useState(true);


  useEffect(
    () => {
      // Go into the database and inside the "tweets" collection find a tweet that has an id === "tweetID"
      const unsubscribe = onSnapshot(doc(db, "tweets", tweetID), (snapshot) => {
        setTweet(snapshot.data());
        setLoading(false);
      });
      return () => unsubscribe();
    },
    [db, tweetID]
  );

  return (
    loading ? <TweetSkeletonLoader /> : <Tweet id={tweetID} tweet={{
      ...tweet,
      tweetId: tweetID
    }} tweetID={tweetID} />
  );
};

export default TweetWithID;