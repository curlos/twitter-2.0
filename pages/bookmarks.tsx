import { collection, onSnapshot, getDocs, query, where, documentId } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef } from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import AppLayout from '../components/Layout/AppLayout';
import PageHeader from '../components/Layout/PageHeader';
import ContentContainer from '../components/Layout/ContentContainer';
import SortableTweetList from '../components/SortableTweetList';
import { db } from '../firebase';

const Bookmarks = () => {
  useAuthRedirect();
  const { data: session } = useSession();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const tweetUnsubscribers = useRef([]);

  useEffect(() => {
    if (!session?.user?.uid) {
      return;
    }

    setLoading(true);

    const unsubscribeBookmarks = onSnapshot(
      collection(db, 'users', session.user.uid, 'bookmarks'),
      async (bookmarksSnapshot) => {
        try {
          // Clean up previous tweet listeners
          tweetUnsubscribers.current.forEach(unsubscribe => unsubscribe());
          tweetUnsubscribers.current = [];

          if (bookmarksSnapshot.empty) {
            setTweets([]);
            setLoading(false);
            return;
          }

          const bookmarkDocs = bookmarksSnapshot.docs;
          const tweetIDs = bookmarkDocs.map(doc => doc.data().tweetID);

          if (tweetIDs.length === 0) {
            setTweets([]);
            setLoading(false);
            return;
          }

          // Fetch initial tweet data in batches
          const batchedTweetData = [];
          const batchSize = 10;

          for (let i = 0; i < tweetIDs.length; i += batchSize) {
            const batch = tweetIDs.slice(i, i + batchSize);
            const tweetsQuery = query(
              collection(db, "tweets"),
              where(documentId(), 'in', batch)
            );
            const tweetsSnapshot = await getDocs(tweetsQuery);
            const batchData = tweetsSnapshot.docs.map(doc => ({
              id: doc.id,
              data: () => doc.data()
            }));
            batchedTweetData.push(...batchData);
          }

          // Set initial tweet data
          setTweets(batchedTweetData);
          setLoading(false);

          // Set up real-time listeners for each individual tweet
          tweetIDs.forEach(tweetID => {
            const unsubscribeTweet = onSnapshot(
              query(collection(db, "tweets"), where(documentId(), '==', tweetID)),
              (tweetSnapshot) => {
                if (!tweetSnapshot.empty) {
                  const updatedTweetDoc = tweetSnapshot.docs[0];
                  const updatedTweet = {
                    id: updatedTweetDoc.id,
                    data: () => updatedTweetDoc.data()
                  };

                  // Update the specific tweet in the tweets array
                  setTweets(prevTweets =>
                    prevTweets.map(tweet =>
                      tweet.id === tweetID ? updatedTweet : tweet
                    )
                  );
                }
              }
            );
            tweetUnsubscribers.current.push(unsubscribeTweet);
          });

        } catch (error) {
          console.error('Error fetching bookmarks:', error);
          setTweets([]);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeBookmarks();
      // Clean up all tweet listeners
      tweetUnsubscribers.current.forEach(unsubscribe => unsubscribe());
    };
  }, [session?.user?.uid]);

  return (
    <AppLayout title="Bookmarks / Twitter 2.0">
      <ContentContainer>
        <PageHeader
          title="Bookmarks"
          subtitle={session?.user ? `@${session.user.tag}` : undefined}
        />

        <SortableTweetList
          tweets={tweets}
          loading={loading}
          emptyStateMessage="No Bookmarks"
          emptyStateSubtitle="When you bookmark tweets, they'll show up here."
          itemsPerPage={10}
        />
      </ContentContainer>
    </AppLayout>
  );
};

export default Bookmarks;
