import { doc, DocumentData, getDoc, onSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { tweetBeingRepliedToIdState } from '../atoms/atom';
import { db } from '../firebase';
import { ITweet } from '../utils/types';

interface Props {
  fromModal: boolean;
}

/**
 * @description - When someone is replying to a tweet, they will see the tweet they are replying to in a modal with all the basic information about the tweet (author's profile pic, name, username, date posted, text, and image).
 * @returns {React.FC}
 */
const ParentTweet = ({ fromModal }: Props) => {

  const [tweetBeingRepliedToId, _setTweetBeingRepliedToId] = useRecoilState(tweetBeingRepliedToIdState);
  const [tweet, setTweet] = useState<ITweet>();
  const [author, setAuthor] = useState<DocumentData>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If there's a tweetId, it must mean that the new tweet being drafted is replying to an EXISTING tweet so we need to go into the database and find all the information about this existing tweet.
    if (tweetBeingRepliedToId) {
      setLoading(true);

      const unsubscribe = onSnapshot(doc(db, 'tweets', tweetBeingRepliedToId), (snapshot) => {
        setTweet(snapshot.data() as ITweet);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (tweet) {
      setLoading(true);

      const docRef = doc(db, "users", tweet.userID);
      getDoc(docRef).then((snap) => {
        if (isMounted) {
          setAuthor(snap.data());
          setLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [tweet]);

  return (
    !loading ? (
      tweet && author ? (
        <div className="flex p-3 space-x-2 pb-0 h-full">
          <div className="min-w-[55px] h-full">
            <img src={author.profilePic} alt="" className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer" />
            {/* <span className="border-r-2 border-[#AAB8C2]  dark:border-gray-700 absolute ml-[27px] h-[100%]" /> */}
          </div>

          {/* Show basic information about the tweet. Does not include the tweet's stats (retweets, likes, comments, bookmarks) */}
          <div>
            <div className="text-gray-400 lg:flex">
              <div className="text-black dark:text-white font-bold mr-[2px]">{author.name}</div>
              <div>@{author.tag}</div>
              <div className="text-gray-500 mx-1 font-bold hidden lg:block">·</div>
              {tweet.timestamp && tweet.timestamp.seconds && (
                <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
              )}
            </div>

            <div>
              <div className="text-black dark:text-white break-words max-w-[420px]">{tweet.text}</div>

              {tweet.image && (
                <div className="pt-3">
                  <img src={tweet.image} alt="" className="rounded-2xl max-h-[500px] object-contain" />
                </div>
              )}
            </div>

            <div className="my-3 text-gray-400">
              Replying to <span className="text-lightblue-400">
                <Link href={`/profile/${author.tag}`}>
                  <span>@{author.tag}</span>
                </Link>
              </span>
            </div>
          </div>
        </div>
      ) : null
    ) : null
  );
};

export default ParentTweet;
