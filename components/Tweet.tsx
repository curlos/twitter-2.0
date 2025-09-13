import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import Router, { useRouter } from 'next/router';
import { newTweetModalState, tweetBeingRepliedToIdState, colorThemeState } from '../atoms/atom';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, serverTimestamp, setDoc } from '@firebase/firestore';
import { db } from '../firebase';
import { getDoc, orderBy, query } from 'firebase/firestore';
import { TweetDropdown } from './TweetDropdown';
import { FaRetweet, FaRegComment, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { HiBadgeCheck } from 'react-icons/hi';
import { BsPencilFill } from 'react-icons/bs';
import { RiHeart3Fill, RiHeart3Line } from 'react-icons/ri';
import Link from 'next/link';
import { IAuthor } from '../utils/types';

interface Props {
  id: string,
  tweet: any,
  tweetID: string,
  tweetPage?: boolean;
  topParentTweet?: boolean;
  pastTweet?: boolean;
}

/**
 * @description - Renders a tweet with the following:
 * AUTHOR - Profile pic, name, username.
 * CONTENT - Time posted, text, image, whether it's been edited or not.
 * ACTIONS - Replying, retweeting, liking, bookmarking it.
 * AUTHOR ACTIONS - Deleting or editing it.
 * @returns {React.FC}
 */
const Tweet = ({ id, tweet, tweetID, tweetPage, topParentTweet, pastTweet }: Props) => {

  const { data: session } = useSession();
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const [_tweetBeingRepliedToId, setTweetBeingRepliedToId] = useRecoilState(tweetBeingRepliedToIdState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);
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
  const router = useRouter();

  // Get REPLIES
  useEffect(() => {
    // Goes through all the tweets in the database and looks for the tweet with the corresponding tweet id and gets the list of replies on that tweet (the replies will be a list of tweets) and orders it from newest to oldest.
    onSnapshot(query(
      collection(db, 'tweets', String(tweetID), 'replies'),
      orderBy('timestamp', 'desc')
    ),
      (snapshot) => setReplies(snapshot.docs));
  }, [id, tweetID]);

  // Get LIKES
  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'likes'), (snapshot) => setLikes(snapshot.docs));
  }, [id, tweetID]);

  // Get RETWEETS
  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'retweets'), (snapshot) => setRetweets(snapshot.docs));
  }, [id, tweetID]);

  // Get REPLIES
  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'replies'), (snapshot) => setReplies(snapshot.docs));
  }, [id, tweetID]);

  // Get BOOKMARKS
  useEffect(() => {
    onSnapshot(collection(db, 'tweets', tweetID, 'bookmarks'), (snapshot) => setBookmarks(snapshot.docs));
  }, [id, tweetID]);

  // Check if the logged in user (if any) has liked this tweet
  useEffect(() => {
    // Go through the array of likes (will be a list of users) and find out if the currently logged in user (if any) is among the id's of users who liked the tweet.
    setLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1);
  }, [likes]);

  // Check if the logged in user (if any) has retweeted this tweet
  useEffect(() => {
    // Go through the array of retweets (will be a list of users) and find out if the currently logged in user (if any) is among the id's of users who retweeted the tweet.
    setRetweeted(retweets.findIndex((retweet) => retweet.id === session?.user.uid) !== -1);
  }, [retweets]);

  // Check if the logged in user (if any) has bookmarked this tweet
  useEffect(() => {
    // Go through the array of bookmarks (will be a list of users) and find out if the currently logged in user (if any) is among the id's of users who bookmarked the tweet.
    setBookmarked(bookmarks.findIndex((bookmark) => bookmark.id === session?.user.uid) !== -1);
  }, [bookmarks]);

  // Get the author of the tweet
  useEffect(() => {
    // Go through all the users in the database and find the one with the same ID as the tweet's "userID"
    const docRef = doc(db, "users", tweet.userID);
    getDoc(docRef).then((snap) => {
      setAuthorId(snap.id);
      setAuthor(snap.data() as IAuthor);
      setLoading(false);
    });
  }, [id]);

  // Get the PARENT tweet (Only if the current tweet is a reply to another tweet, the parent tweet)
  useEffect(() => {
    // If this tweet has a "parentTweet", then this tweet is a REPLY to another tweet, the parent tweet.
    if (tweet.parentTweet && tweet.parentTweet !== "") {
      // tweet.parentTweet probably equals the parentTweet's "id" so we can use that to go through the tweets in the database and find the parent tweet. 
      const docRef = doc(db, "tweets", String(tweet.parentTweet));
      getDoc(docRef).then((snap) => {
        setParentTweet(snap);
      });
    }
  }, [id]);

  // Get the AUTHOR of the PARENT TWEET (IF it exists AND the current tweet is a REPLY)
  useEffect(() => {
    // TODO: Check what happens when a tweet is deleted. What do the replies show? Should show something like: "This tweet has been deleted." but it doesn't seem like it'd show it from a reply tweet.
    if (parentTweet && parentTweet.data()) {
      const docRef = doc(db, "users", String(parentTweet.data().userID));
      getDoc(docRef).then((snap) => {
        setParentTweetAuthor(snap.data());
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, parentTweet]);

  // Not entirely sure what this is for. Seems redundant to have this being checked with the retweets collection also available. Perhaps it was a way to QUICKLY check if the logged in user retweeted the current tweet.
  // TODO: The "tweet" value is coming from a prop so need to check why it's being passed through a prop why it's being checked like this. Seems like something would go wrong with only one user at a time being set on the tweet.retweetedBy property. So if a second person retweeted it, their ID would get set on the property and replace the first person.
  // I think the main reason I did this was to be efficient and reduce the amount of queries I had to make the DB.
  useEffect(() => {
    if (tweet.retweetedBy) {
      const docRef = doc(db, "users", tweet.retweetedBy);
      getDoc(docRef).then((snap) => {
        setRetweetedBy(snap.data());
        setLoading(false);
      });
    }
  }, [tweet.retweetedBy]);


  /**
   * @description - Handles what happens when a user clicks the "like" button on a tweet.
   */
  const likeTweet = async () => {
    // If the user is not logged in, then redirect them to the auth page
    if (!session) {
      Router.push('/auth');
      return;
    }

    // If the tweet is ALREADY LIKED by the current user then, UNLIKE the tweet
    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid));
      await deleteDoc(doc(db, "users", session.user.uid, "likes", id));
    } else {
      // Else if the tweet HAS NOT BEEN LIKED by the current user, then LIKE the tweet
      await setDoc(doc(db, "tweets", id, "likes", session.user.uid), {
        name: session.user.name,
        likedAt: serverTimestamp(),
        likedBy: session.user.uid
      });
      await setDoc(doc(db, "users", session.user.uid, "likes", id), {
        ...tweet,
        likedAt: serverTimestamp(),
        likedBy: session.user.uid
      });
    }
  };

  /**
   * @description - Handles what happens when a user clicks the "bookmark" button on a tweet.
   */
  const bookmarkTweet = async () => {
    // If the user is not logged in, then redirect them to the auth page
    if (!session) {
      Router.push('/auth');
      return;
    }

    // If the tweet is already BOOKMARKED by the current user then UNBOOKMARK
    if (bookmarked) {
      await deleteDoc(doc(db, "tweets", id, "bookmarks", session.user.uid));
      await deleteDoc(doc(db, "users", session.user.uid, "bookmarks", id));
    } else {
      // Else if the tweet HAS NOT BEEN BOOKMARKED by the current user, then BOOKMARK the tweet
      await setDoc(doc(db, "tweets", id, "bookmarks", session.user.uid), {
        userID: session.user.uid
      });
      await setDoc(doc(db, "users", session.user.uid, "bookmarks", id), {
        tweetID: id
      });
    }
  };

  /**
   * @description - Handles what happens when a user clicks the "retweet" button on a tweet.
   */
  const retweetTweet = async () => {
    // If the user is not logged in, then redirect them to the auth page
    if (!session) {
      Router.push('/auth');
      return;
    }

    // If the tweet is already RETWEETED by the current user then, UNRETWEET
    if (retweeted) {
      await deleteDoc(doc(db, "tweets", id, "retweets", session.user.uid));
      await deleteDoc(doc(db, "users", session.user.uid, "retweets", id));
    } else {
      await setDoc(doc(db, "tweets", id, "retweets", session.user.uid), {
        name: session.user.name,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user.uid
      });
      await setDoc(doc(db, "users", session.user.uid, "retweets", id), {
        ...tweet,
        retweetedAt: serverTimestamp(),
        retweetedBy: session.user.uid
      });
    }
  };

  /**
   * @description - Handles a tweet being deleted. Will only be deleted if the author of the tweet is the one attempting to delete it.
   * @param {React.FormEvent} e 
   */
  const deleteTweet = async (e: React.FormEvent) => {
    e.stopPropagation();

    // If the user is not logged in, then redirect them to the auth page.
    if (!session) {
      router.push('/auth');
      return;
    }

    const isAuthorOfTweet = (authorId === session?.user?.uid);

    // Will only delete the tweet if the person attempting to delete is the author of the tweet.
    if (isAuthorOfTweet) {
      deleteDoc(doc(db, 'tweets', id)).then(() => router.push('/'));
    }
  };

  /**
   * @description - Opens a modal to reply to the current tweet.
   */
  const handleReplyToTweet = (e) => {
    e.stopPropagation();

    if (!session) {
      router.push('/auth');
      return;
    }

    setTweetBeingRepliedToId(id);
    setIsOpen(true);
  };

  /**
   * @description - Gets the longest word in string (separated by whitespace).
   * @returns {String}
   */
  const getLongestWord = () => {
    if (!tweet.text) {
      return '';
    } else {
      return tweet.text.split(' ').reduce((a, b) => a.length > b.length ? a : b);
    }
  };

  // Check if the tweet has been edited at least once.
  const editedTweet = tweet?.versionHistory && tweet.versionHistory.length > 0;

  const renderTweetContent = () => (
    <div>
      {/* Check if the tweet was retweeted by a user and display a message at the top if they did like: "Cristiano Ronaldo retweeted" */}
      <div className="text-gray-500 text-sm">{retweetedBy ? (
        <div className="font-semibold ml-[63px]">
          <Link href={`/profile/${retweetedBy.tag}`}>
            <span className="flex hover:underline">
              <FaRetweet className="h-[18px] w-[18px] mr-2 mb-2" />
              {session && session.user && retweetedBy.tag === session.user.tag ? 'You retweeted' : `${retweetedBy.name} retweeted`}
            </span>
          </Link>
        </div>
      ) : null}</div>
      <div className="flex">
        {/* Profile pic */}
        <div className="mr-2">
          <Link href={`/profile/${author.tag}`}>
            <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer" />
          </Link>
        </div>

        <div className="flex flex-col justify-between w-full">
          {/* List of information about the tweet at the top - Author name, author username, verified user badge, timestamp, whether it's been edited or not. */}
          <div className="flex justify-between w-full">
            <div className="lg:flex">
              <div className="flex">
                <Link href={`/profile/${author.tag}`}>
                  <div className="cursor-pointer hover:underline font-bold">{author.name}</div>
                </Link>
                <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
              </div>
              <div className="text-gray-500">@{author.tag}</div>
              <div className="hidden lg:block text-gray-500 mx-1 font-bold">·</div>
              {tweet.timestamp && tweet.timestamp.seconds && (
                <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
              )}

              {/* Shows the pencil if the tweet has been edited. */}
              {editedTweet && <div className="hidden lg:block text-gray-500 mx-1 font-bold">·</div>}
              {editedTweet && <BsPencilFill className="h-[18px] w-[18px] ml-[2px] text-gray-500" />}
            </div>

            {/* Dropdown - Hidden for past tweets */}
            {!pastTweet && (
              <TweetDropdown tweet={
                {
                  ...tweet,
                  tweetId: id
                }
              } author={author} authorId={authorId} deleteTweet={deleteTweet} />
            )}
          </div>

          {/* Renders a message saying that this tweet is a reply to another one with the parent tweet's author's username in the message. For example, "Replying to @wojespn" */}
          <div className="pb-3">
            {parentTweet && parentTweetAuthor ? (
              <div className="text-[15px] text-gray-500">
                Replying to
                <Link href={`/profile/${author.tag}`}>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@{parentTweetAuthor.tag}</span>
                </Link>
              </div>
            ) : null}
            <div className={`${pastTweet ? ' text-gray-500' : ''} ${getLongestWord().length > 26 ? 'break-all' : 'break-words'}`} style={{ whiteSpace: 'pre-line' }}>{tweet.text}</div>
            {tweet.image && (
              <div className="pt-3">
                <img src={tweet.image} alt="" className="rounded-2xl max-h-[500px] object-contain border border-gray-400 dark:border-gray-700" />
              </div>
            )}
          </div>

          {/* Action buttons - Hidden for past tweets */}
          {!pastTweet && (
            <div className="flex justify-start w-full text-gray-500">
              {/* Reply/Comment button */}
              <div className="flex-1 items-center flex space-x-2" onClick={handleReplyToTweet}>
                <FaRegComment className="h-[18px] w-[18px] cursor-pointer" />
                <div>{replies.length}</div>
              </div>

              {/* Retweet button */}
              <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                e.stopPropagation();
                retweetTweet();
              }}>
                {!retweeted ? <FaRetweet className={`h-[18px] w-[18px] cursor-pointer`} /> : <FaRetweet className={`h-[18px] w-[18px] cursor-pointer text-green-400`} />}
                <div className={retweeted ? "text-green-400" : "text-gray-500"}>{retweets.length}</div>
              </div>

              {/* Like button */}
              <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                e.stopPropagation();
                likeTweet();
              }}>
                {!liked ? <RiHeart3Line className={`h-[18px] w-[18px] cursor-pointer`} /> : <RiHeart3Fill className={`h-[18px] w-[18px] cursor-pointer text-red-500`} />}
                <div className={liked ? "text-red-500" : "text-gray-500"}>{likes.length}</div>
              </div>

              {/* Bookmark button */}
              <div className="flex-1 items-center flex space-x-2" onClick={(e) => {
                e.stopPropagation();
                bookmarkTweet();
              }}>
                {bookmarked ? (
                  <FaBookmark className={`h-[18px] w-[18px] cursor-pointer text-yellow-500`} />
                ) : (
                  <FaRegBookmark className={`h-[18px] w-[18px] cursor-pointer`} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    // In this component, there are two ways a tweet will be shown: 
    // - As a tweet in a page where we are on the page of that tweet and show the thread of replies below the tweet as well as other detailed info like the specific time it was posted, device it was posted on, and the exact stats of each action (replies, retweets, likes, bookmarks)
    // - As a tweet in a list where we WON'T see any of the more detailed info and will see the simplified version of it with the author and the content of the tweet.
    !tweetPage ? (
      !loading && author ? (
        // This is the SIMPLE tweet where we won't see as much detailed information (like a thread of replies) but ONLY the content of the tweet and the author.
        <div className={`${theme} max-w-full text-base p-3 w-full ${!pastTweet ? 'cursor-pointer' : ''} ${!topParentTweet ? 'border-b border-[#AAB8C2]  dark:border-gray-700' : ''}`}>
          {pastTweet ? (
            <div onClick={(e) => e.preventDefault()}>
              {renderTweetContent()}
            </div>
          ) : (
            <Link href={`/tweet/${tweetID}`}>
              {renderTweetContent()}
            </Link>
          )}
        </div>
      ) : null
    ) : (
      !loading && author ? (
        // This shows the other view, the FULL-SIZED Tweet when it's on it's own page.
        <div className="text-base p-5 border-b border-[#AAB8C2] dark:border-gray-700 w-full">

          {/* Top of the tweet where the information about it's author is shown.  */}
          <div className="flex justify-between">
            <div className="flex">
              <Link href={`/profile/${author.tag}`}>
                <div className="mr-2">
                  <img src={author.profilePic} alt={author.name} className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer" />
                </div>
              </Link>

              <div className="">
                <Link href={`/profile/${author.tag}`}>
                  <div className="flex">
                    <div className="cursor-pointer hover:underline font-bold">{author.name}</div>
                    <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
                  </div>
                </Link>
                <div className="text-gray-400 p-0 m-0">@{author.tag}</div>
              </div>
            </div>

            {/* Dropdown where different actions can be seen - Hidden for past tweets */}
            {!pastTweet && (
              <TweetDropdown tweet={{
                ...tweet,
                tweetId: id
              }} author={author} authorId={authorId} deleteTweet={deleteTweet} />
            )}
          </div>

          {/* This will be shown if the parent tweet has been deleted. */}
          {/* TODO: I thought earlier that maybe this wasn't taken care of but it seems like I did. Will have to confirm. */}
          {parentTweet && !parentTweet.data() && (
            <div className="text-xl w-full">
              <div className="text-[15px] text-gray-500">
                <span>Replying to</span>
                <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@deleted</span>
              </div>
            </div>
          )}

          <div className="text-xl pt-3 w-full">
            {/* Renders a message saying that this tweet is a reply to another one with the parent tweet's author's username in the message. For example, "Replying to @wojespn" */}
            {parentTweet && parentTweetAuthor ? (
              <div className="text-[15px] text-gray-500">
                <span>Replying to</span>
                <Link href={`/profile/${author.tag}`}>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@{parentTweetAuthor.tag}</span>
                </Link>
              </div>
            ) : null}

            {/* Main content of the tweet - Renders both the text AND image in the tweet. */}
            <div className="break-all" style={{ whiteSpace: 'pre-line' }}>{tweet.text}</div>
            {tweet.image && (
              <div className="pt-3">
                <img src={tweet.image} alt="" className="rounded-2xl w-full object-contain border border-[#AAB8C2]  dark:border-gray-700" />
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-500">
            <div className={`flex gap-1 py-4 ${editedTweet ? 'cursor-pointer' : ''}`} onClick={() => {
              if (editedTweet) {
                router.push(`/tweet/${id}/history`);
              }
            }}>
              {/* If the tweet has been edited, the last edited time will be displayed and if the link is clicked, the user will be redirected to the tweet version history page. */}
              {editedTweet && <BsPencilFill className="h-[18px] w-[18px] ml-[2px] text-gray-500 mr-1" />}
              <span className={`flex gap-1 border-b border-transparent${editedTweet ? ' hover:border-gray-500' : ''}`}>
                {editedTweet && <div className="text-gray-500">Last edited</div>}
                <div className="text-gray-500">{tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format('LT') : 'Just now'}</div>
                <div className="text-gray-500 font-bold">·</div>
                <div className="text-gray-500">{tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format('ll') : 'Today'}</div>
                <div className="text-gray-500 font-bold">·</div>
                <div className="text-gray-500">Twitter for Web</div>
              </span>
            </div>

            {/* Row of stats for each different action: Replies, Retweets, Likes - Hidden for past tweets */}
            {/* TODO: Add bookmarks here. Maybe take a look at adding views as well. That's much more optional though. */}
            {!pastTweet && (
              <div className="flex space-x-4 py-4">
                <div className="space-x-1">
                  <span className="font-bold">{replies.length}</span>
                  <span className="text-gray-500">Replies</span>
                </div>

                <div className="space-x-1">
                  <span className="font-bold">{retweets.length}</span>
                  <span className="text-gray-500">Retweets</span>
                </div>

                <div className="space-x-1">
                  <span className="font-bold">{likes.length}</span>
                  <span className="text-gray-500">Likes</span>
                </div>
              </div>
            )}

            {/* Row of different actions that can be performed on the tweet: Reply/Comment, Retweet, Like, and Bookmark - Hidden for past tweets */}
            {!pastTweet && (
              <div className="flex justify-between w-full text-gray-500 py-2 px-12">
                {/* Reply button */}
                <div className="flex space-x-2" onClick={handleReplyToTweet}>
                  <FaRegComment className="h-6 w-6 cursor-pointer" />
                </div>

                {/* Retweet button */}
                <div className="flex space-x-2" onClick={(e) => {
                  e.stopPropagation();
                  retweetTweet();
                }}>
                  {!retweeted ? <FaRetweet className={`h-6 w-6 cursor-pointer`} /> : <FaRetweet className={`h-6 w-6 cursor-pointer text-green-400`} />}
                </div>

                {/* Like Button */}
                <div className="flex space-x-2" onClick={(e) => {
                  e.stopPropagation();
                  likeTweet();
                }}>
                  {!liked ? <RiHeart3Line className={`h-6 w-6 cursor-pointer`} /> : <RiHeart3Fill className={`h-6 w-6 cursor-pointer text-red-500`} />}
                </div>

                {/* Bookmark button */}
                <div className="flex space-x-2" onClick={(e) => {
                  e.stopPropagation();
                  bookmarkTweet();
                }}>
                  {bookmarked ? (
                    <FaBookmark className={`h-6 w-6 cursor-pointer text-yellow-500`} />
                  ) : (
                    <FaRegBookmark className={`h-6 w-6 cursor-pointer`} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null
    )
  );
};

export default Tweet;