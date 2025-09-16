import { deleteDoc, doc, setDoc, serverTimestamp } from "@firebase/firestore";
import NumberFlow from "@number-flow/react";
import { useRouter, Router } from "next/router";
import { FaRegComment, FaRetweet, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { RiHeart3Line, RiHeart3Fill } from "react-icons/ri";
import { db } from "../../firebase";

interface TweetActionsProps {
  id: string;
  tweet: any;
  replies: any[];
  retweets: any[];
  likes: any[];
  bookmarks: any[];
  liked: boolean;
  retweeted: boolean;
  bookmarked: boolean;
  session: any;
  setTweetBeingRepliedToId: (id: string) => void;
  setIsOpen: (open: boolean) => void;
  fullSize?: boolean;
}

/**
 * Tweet action buttons component (Reply, Retweet, Like, Bookmark)
 */
const TweetActions = ({
  id,
  tweet,
  replies,
  retweets,
  likes,
  bookmarks,
  liked,
  retweeted,
  bookmarked,
  session,
  setTweetBeingRepliedToId,
  setIsOpen,
  fullSize = false
}: TweetActionsProps) => {
  const router = useRouter();

  /**
   * @description - Handles what happens when a user clicks the "like" button on a tweet.
   */
  const likeTweet = async () => {
    if (!session) {
      Router.push('/auth');
      return;
    }

    if (liked) {
      await deleteDoc(doc(db, "tweets", id, "likes", session.user.uid));
      await deleteDoc(doc(db, "users", session.user.uid, "likes", id));
    } else {
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
    if (!session) {
      Router.push('/auth');
      return;
    }

    if (bookmarked) {
      await deleteDoc(doc(db, "tweets", id, "bookmarks", session.user.uid));
      await deleteDoc(doc(db, "users", session.user.uid, "bookmarks", id));
    } else {
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
    if (!session) {
      Router.push('/auth');
      return;
    }

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
   * @description - Opens a modal to reply to the current tweet.
   */
  const handleReplyToTweet = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      router.push('/auth');
      return;
    }

    setTweetBeingRepliedToId(id);
    setIsOpen(true);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeTweet();
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    retweetTweet();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkTweet();
  };

  if (fullSize) {
    return (
      <div className="flex justify-between w-full text-gray-500 py-2 px-12">
        {/* Reply button */}
        <div className="p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleReplyToTweet}>
          <FaRegComment className="h-6 w-6 group-hover:text-blue-500 transition-colors duration-200" />
        </div>

        {/* Retweet button */}
        <div className="p-2 rounded-full hover:bg-green-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleRetweet}>
          {!retweeted ? (
            <FaRetweet className="h-6 w-6 group-hover:text-green-400 transition-colors duration-200" />
          ) : (
            <FaRetweet className="h-6 w-6 text-green-400" />
          )}
        </div>

        {/* Like Button */}
        <div className="p-2 rounded-full hover:bg-red-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleLike}>
          {!liked ? (
            <RiHeart3Line className="h-6 w-6 group-hover:text-red-500 transition-colors duration-200" />
          ) : (
            <RiHeart3Fill className="h-6 w-6 text-red-500" />
          )}
        </div>

        {/* Bookmark button */}
        <div className="p-2 rounded-full hover:bg-yellow-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleBookmark}>
          {bookmarked ? (
            <FaBookmark className="h-5 w-5 text-yellow-500" />
          ) : (
            <FaRegBookmark className="h-5 w-5 group-hover:text-yellow-500 transition-colors duration-200" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full text-gray-500">
      {/* Reply/Comment button */}
      <div className="flex-1 items-center flex">
        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleReplyToTweet}>
          <FaRegComment className="h-[18px] w-[18px] group-hover:text-blue-500 transition-colors duration-200" />
          <div className="group-hover:text-blue-500 transition-colors duration-200">{replies.length}</div>
        </div>
      </div>

      {/* Retweet button */}
      <div className="flex-1 items-center flex">
        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-green-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleRetweet}>
          {!retweeted ? (
            <FaRetweet className="h-[18px] w-[18px] group-hover:text-green-400 transition-colors duration-200" />
          ) : (
            <FaRetweet className="h-[18px] w-[18px] text-green-400" />
          )}
          <NumberFlow
            value={retweets.length}
            className={`${retweeted ? "text-green-400" : "text-gray-500 group-hover:text-green-400"} transition-colors duration-200`}
          />
        </div>
      </div>

      {/* Like button */}
      <div className="flex-1 items-center flex">
        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-red-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleLike}>
          {!liked ? (
            <RiHeart3Line className="h-[18px] w-[18px] group-hover:text-red-500 transition-colors duration-200" />
          ) : (
            <RiHeart3Fill className="h-[18px] w-[18px] text-red-500" />
          )}
          <NumberFlow
            value={likes.length}
            className={`${liked ? "text-red-500" : "text-gray-500 group-hover:text-red-500"} transition-colors duration-200`}
          />
        </div>
      </div>

      {/* Bookmark button */}
      <div className="flex-1 items-center flex">
        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-yellow-500/20 transition-colors duration-200 cursor-pointer group" onClick={handleBookmark}>
          {bookmarked ? (
            <FaBookmark className="h-[16px] w-[16px] text-yellow-500" />
          ) : (
            <FaRegBookmark className="h-[16px] w-[16px] group-hover:text-yellow-500 transition-colors duration-200" />
          )}
          <NumberFlow
            value={bookmarks.length}
            className={`${bookmarked ? "text-yellow-500" : "text-gray-500 group-hover:text-yellow-500"} transition-colors duration-200`}
          />
        </div>
      </div>
    </div>
  );
};

export default TweetActions