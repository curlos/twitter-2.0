import { collection, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import AppLayout from '../components/Layout/AppLayout';
import PageHeader from '../components/Layout/PageHeader';
import ContentContainer from '../components/Layout/ContentContainer';
import TweetWithID from '../components/TweetWithID';
import InfiniteScroll from '../components/InfiniteScroll';
import { db } from '../firebase';

const Followers = () => {
  useAuthRedirect();
  const { data: session } = useSession();
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
    <AppLayout title="Bookmarks / Twitter 2.0">
      <ContentContainer loading={loading}>
        <PageHeader
          title="Bookmarks"
          subtitle={session?.user ? `@${session.user.tag}` : undefined}
        />

        <InfiniteScroll
          items={tweets}
          renderItem={(tweet) => (
            <TweetWithID key={tweet.data().tweetID} tweetID={tweet.data().tweetID} />
          )}
          itemsPerPage={10}
          loading={loading}
        />
      </ContentContainer>
    </AppLayout>
  );
};

export default Followers;
