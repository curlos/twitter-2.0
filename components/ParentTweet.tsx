import { doc, DocumentData, getDoc, onSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ITweet } from '../utils/types';
import { PhotographIcon } from '@heroicons/react/solid';
import DeletedTweet from './DeletedTweet';
import { HiBadgeCheck } from 'react-icons/hi';

interface ParentTweetProps {
  tweetBeingRepliedToId: string;
  isQuoteTweet: boolean;
  fromTweetModal?: boolean;
}

/**
 * @description - When someone is replying to a tweet, they will see the tweet they are replying to in a modal with all the basic information about the tweet (author's profile pic, name, username, date posted, text, and image).
 * @returns {React.FC}
 */
const ParentTweet = ({ tweetBeingRepliedToId, isQuoteTweet, fromTweetModal = false }: ParentTweetProps) => {
  const [tweet, setTweet] = useState<ITweet>();
  const [author, setAuthor] = useState<DocumentData>();
  const [loading, setLoading] = useState(false);
  const [tweetExists, setTweetExists] = useState(true);
  const router = useRouter();

  const getLongestWord = () => {
    if (!tweet?.text) {
      return '';
    } else {
      return tweet.text.split(' ').reduce((a, b) => a.length > b.length ? a : b);
    }
  };

  const handleTweetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fromTweetModal && isQuoteTweet) {
      router.push(`/tweet/${tweetBeingRepliedToId}`);
    }
  };

  useEffect(() => {
    // If there's a tweetId, it must mean that the new tweet being drafted is replying to an EXISTING tweet so we need to go into the database and find all the information about this existing tweet.
    if (tweetBeingRepliedToId) {
      setLoading(true);

      const unsubscribe = onSnapshot(doc(db, 'tweets', tweetBeingRepliedToId), (snapshot) => {
        if (snapshot.exists()) {
          setTweet(snapshot.data() as ITweet);
          setTweetExists(true);
        } else {
          // Tweet doesn't exist (was deleted)
          setTweet(undefined);
          setTweetExists(false);
        }
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

  // Deleted tweet component for quote tweets
  const DeletedQuoteTweet = () => (
    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl p-4">
      <div className="bg-gray-200 border border-gray-300 text-gray-500 dark:text-gray-400 rounded-xl p-3 text-base dark:border-gray-700 dark:bg-gray-800">
        This Tweet is unavailable.
      </div>
    </div>
  );

  return (
    !loading ? (
      !tweetExists ? (
        // Show deleted tweet placeholder
        isQuoteTweet ? <DeletedQuoteTweet /> : <DeletedTweet />
      ) : tweet && author ? (
        <div
          className={`flex p-3 space-x-2 h-full relative ${isQuoteTweet ? 'border border-gray-700 rounded-2xl' : ''} ${isQuoteTweet && !fromTweetModal ? 'hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer' : ''}`}
          onClick={handleTweetClick}
        >
          <div className="min-w-[55px] relative">
            <img src={author.profilePic} alt="" className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer" />
            {tweetBeingRepliedToId && !isQuoteTweet && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-[55px] bottom-[-24px] w-0.5 bg-gray-400 dark:bg-gray-600"></div>
            )}
          </div>

          {/* Show basic information about the tweet. Does not include the tweet's stats (retweets, likes, comments, bookmarks) */}
          <div className="w-full">
            <div className="text-gray-700 dark:text-gray-400 lg:flex items-center">
              <div className="flex items-center mr-[2px]">
                <div className="text-black dark:text-white font-bold truncate max-w-[150px] sm:max-w-[200px]">{author.name}</div>
                <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
              </div>
              <div>@{author.tag}</div>
              <div className="text-gray-500 mx-1 font-bold hidden lg:block">·</div>
              {tweet.timestamp && tweet.timestamp.seconds && (
                <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
              )}
            </div>

            <div>
              <div className={`text-black dark:text-white ${getLongestWord().length > 26 ? "break-all" : "break-words"}`} style={{ whiteSpace: "pre-line" }}>{tweet.text}</div>

              {tweet.images && tweet.images.length > 0 && (
                <div className="pt-3">
                  {tweet.images.length === 1 ? (
                    <img
                      src={tweet.images[0]}
                      alt=""
                      className="rounded-2xl max-h-[500px] w-full object-contain border border-gray-400 dark:border-gray-700"
                    />
                  ) : tweet.images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {tweet.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt=""
                          className={`w-full aspect-[1/1] object-cover border border-gray-400 dark:border-gray-700 ${
                            index === 0 ? 'rounded-l-2xl' : 'rounded-r-2xl'
                          }`}
                        />
                      ))}
                    </div>
                  ) : tweet.images.length === 3 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <img
                        src={tweet.images[0]}
                        alt=""
                        className="rounded-l-2xl w-full h-full object-cover border border-gray-400 dark:border-gray-700"
                      />
                      <div className="flex flex-col gap-2">
                        <img
                          src={tweet.images[1]}
                          alt=""
                          className="rounded-tr-2xl w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700"
                        />
                        <img
                          src={tweet.images[2]}
                          alt=""
                          className="rounded-br-2xl w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {tweet.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt=""
                            className={`w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700 ${
                              index === 0 ? 'rounded-tl-2xl' :
                              index === 1 ? 'rounded-tr-2xl' :
                              index === 2 ? 'rounded-bl-2xl' :
                              'rounded-br-2xl'
                            }`}
                          />
                          {index === 3 && tweet.images.length > 4 && (
                            <div className="absolute bottom-3 right-3 bg-gray-900 hover:bg-black rounded-lg px-4 py-2 transition-all flex items-center gap-2 border border-gray-400 dark:border-gray-700">
                              <PhotographIcon className="h-5 w-5 text-white" />
                              <span className="text-white text-lg font-bold">+{tweet.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isQuoteTweet && (
              <div className="my-3 text-gray-700 dark:text-gray-400">
                Replying to <span className="text-lightblue-400">
                  <Link href={`/profile/${author.tag}`}>
                    <span>@{author.tag}</span>
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null
    ) : null
  );
};

export default ParentTweet;
