import { doc, serverTimestamp, increment, writeBatch } from "@firebase/firestore";
import NumberFlow from "@number-flow/react";
import { useRouter } from "next/router";
import { FaRegComment, FaRetweet, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { RiHeart3Line, RiHeart3Fill } from "react-icons/ri";
import { db } from "../../firebase";

interface TweetActionsProps {
  id: string;
  likesCount: number;
  retweetsCount: number;
  bookmarksCount: number;
  repliesCount: number;
  liked: boolean;
  retweeted: boolean;
  bookmarked: boolean;
  session: any;
  setTweetBeingRepliedToId: (id: string) => void;
  setIsOpen: (open: boolean) => void;
  fullSize?: boolean;
  // Callbacks to update parent state immediately
  onLikeChange?: (liked: boolean) => void;
  onRetweetChange?: (retweeted: boolean) => void;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

/**
 * Tweet action buttons component (Reply, Retweet, Like, Bookmark)
 */
const TweetActions = ({
  id,
  likesCount,
  retweetsCount,
  bookmarksCount,
  repliesCount,
  liked,
  retweeted,
  bookmarked,
  session,
  setTweetBeingRepliedToId,
  setIsOpen,
  fullSize = false,
  onLikeChange,
  onRetweetChange,
  onBookmarkChange
}: TweetActionsProps) => {
  const router = useRouter();

  /**
   * @description - Handles what happens when a user clicks the "like" button on a tweet.
   * Now includes atomic count updates for performance
   */
  const likeTweet = async () => {
    if (!session) {
      router.push('/auth');
      return;
    }

    const newLikedState = !liked;

    // Update UI immediately for better UX
    onLikeChange?.(newLikedState);

    try {
      const batch = writeBatch(db);

      if (liked) {
        // Unlike: remove documents and decrement count
        batch.delete(doc(db, "tweets", id, "likes", session.user.uid));
        batch.delete(doc(db, "users", session.user.uid, "likes", id));
        batch.update(doc(db, "tweets", id), { likesCount: increment(-1) });
      } else {
        // Like: add documents and increment count
        batch.set(doc(db, "tweets", id, "likes", session.user.uid), {
          name: session.user.name,
          likedAt: serverTimestamp(),
          likedBy: session.user.uid
        });
        batch.set(doc(db, "users", session.user.uid, "likes", id), {
          tweetId: id,
          likedAt: serverTimestamp(),
          likedBy: session.user.uid
        });
        batch.update(doc(db, "tweets", id), { likesCount: increment(1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert UI state on error
      onLikeChange?.(liked);
    }
  };

  /**
   * @description - Handles what happens when a user clicks the "bookmark" button on a tweet.
   * Now includes atomic count updates for performance
   */
  const bookmarkTweet = async () => {
    if (!session) {
      router.push('/auth');
      return;
    }

    const newBookmarkedState = !bookmarked;

    // Update UI immediately for better UX
    onBookmarkChange?.(newBookmarkedState);

    try {
      const batch = writeBatch(db);

      if (bookmarked) {
        // Remove bookmark: delete documents and decrement count
        batch.delete(doc(db, "tweets", id, "bookmarks", session.user.uid));
        batch.delete(doc(db, "users", session.user.uid, "bookmarks", id));
        batch.update(doc(db, "tweets", id), { bookmarksCount: increment(-1) });
      } else {
        // Add bookmark: create documents and increment count
        batch.set(doc(db, "tweets", id, "bookmarks", session.user.uid), {
          userID: session.user.uid
        });
        batch.set(doc(db, "users", session.user.uid, "bookmarks", id), {
          tweetID: id
        });
        batch.update(doc(db, "tweets", id), { bookmarksCount: increment(1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating bookmark:', error);
      // Revert UI state on error
      onBookmarkChange?.(bookmarked);
    }
  };

  /**
   * @description - Handles what happens when a user clicks the "retweet" button on a tweet.
   * Now includes atomic count updates for performance
   */
  const retweetTweet = async () => {
    if (!session) {
      router.push('/auth');
      return;
    }

    const newRetweetedState = !retweeted;

    // Update UI immediately for better UX
    onRetweetChange?.(newRetweetedState);

    try {
      const batch = writeBatch(db);

      if (retweeted) {
        // Remove retweet: delete documents and decrement count
        batch.delete(doc(db, "tweets", id, "retweets", session.user.uid));
        batch.delete(doc(db, "users", session.user.uid, "retweets", id));
        batch.update(doc(db, "tweets", id), { retweetsCount: increment(-1) });
      } else {
        // Add retweet: create documents and increment count
        batch.set(doc(db, "tweets", id, "retweets", session.user.uid), {
          name: session.user.name,
          retweetedAt: serverTimestamp(),
          retweetedBy: session.user.uid
        });
        batch.set(doc(db, "users", session.user.uid, "retweets", id), {
          tweetId: id,
          retweetedAt: serverTimestamp(),
          retweetedBy: session.user.uid
        });
        batch.update(doc(db, "tweets", id), { retweetsCount: increment(1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating retweet:', error);
      // Revert UI state on error
      onRetweetChange?.(retweeted);
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
          <div className="group-hover:text-blue-500 transition-colors duration-200">{repliesCount}</div>
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
            value={retweetsCount}
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
            value={likesCount}
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
            value={bookmarksCount}
            className={`${bookmarked ? "text-yellow-500" : "text-gray-500 group-hover:text-yellow-500"} transition-colors duration-200`}
          />
        </div>
      </div>
    </div>
  );
};

export default TweetActions