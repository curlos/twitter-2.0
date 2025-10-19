import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { colorThemeState, authModalState, editInteractionSettingsModalState, editInteractionSettingsTweetState } from '../../atoms/atom';
import { doc, writeBatch, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import useTweetData from './useTweetData';
import ImageModal from '../ImageModal';
import { GlobeIcon, XCircleIcon, UserGroupIcon } from '@heroicons/react/solid';
import ReplyInfoModal from './ReplyInfoModal';
import DeleteTweetModal from './DeleteTweetModal';
import SmallTweet from './SmallTweet';
import BigTweet from './BigTweet';

interface Props {
  id: string,
  tweet: any,
  tweetID: string,
  tweetPage?: boolean;
  topParentTweet?: boolean;
  pastTweet?: boolean;
  showFullView?: boolean;
  showParentTweetConnectingLine?: boolean;
  isReplyTweetWithConnectedLine?: boolean;
  historyLatestTweetIsQuoteTweet?: boolean;
}

/**
 * @description - Renders a tweet with the following:
 * AUTHOR - Profile pic, name, username.
 * CONTENT - Time posted, text, image, whether it's been edited or not.
 * ACTIONS - Replying, retweeting, liking, bookmarking it.
 * AUTHOR ACTIONS - Deleting or editing it.
 * @returns {React.FC}
 */
const Tweet = ({ id, tweet, tweetID, tweetPage, topParentTweet, pastTweet, showFullView = false, showParentTweetConnectingLine = false, isReplyTweetWithConnectedLine = false, historyLatestTweetIsQuoteTweet = false }: Props) => {
  const { data: session } = useSession();
  const [theme, _setTheme] = useRecoilState(colorThemeState);
  const setAuthModalOpen = useSetRecoilState(authModalState);
  const setEditInteractionSettingsModalOpen = useSetRecoilState(editInteractionSettingsModalState);
  const setEditInteractionSettingsTweet = useSetRecoilState(editInteractionSettingsTweetState);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showReplyInfoModal, setShowReplyInfoModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Derive showImageModal from selectedImageIndex
  const showImageModal = selectedImageIndex !== null;
  const router = useRouter();

  // Use the optimized custom hook for tweet data management
  const {
    likesCount,
    retweetsCount,
    bookmarksCount,
    repliesCount,
    liked,
    retweeted,
    bookmarked,
    setLiked,
    setRetweeted,
    setBookmarked,
    parentTweet,
    parentTweetAuthor,
    authorId,
    author,
    retweetedBy,
    loading,
    isQuoteTweet: tweetDataIsQuoteTweet
  } = useTweetData(id, tweet, tweetID, tweetPage);

  const isQuoteTweet = tweetDataIsQuoteTweet || historyLatestTweetIsQuoteTweet
  const replyingToDeletedTweet = tweet?.parentTweet && ((!parentTweet || !parentTweet.data()) && !isQuoteTweet)

  /**
   * @description - Shows the delete confirmation modal
   * @param {React.FormEvent} e
   */
  const deleteTweet = async (e: React.FormEvent) => {
    e.stopPropagation();

    // If the user is not logged in, then show the auth modal.
    if (!session) {
      setAuthModalOpen(true);
      return;
    }

    const isAuthorOfTweet = (authorId === session?.user?.uid);

    // Will only show confirmation if the person is the author of the tweet.
    if (isAuthorOfTweet) {
      setShowDeleteConfirmation(true);
    }
  };

  /**
   * @description - Actually deletes the tweet after confirmation
   */
  const confirmDeleteTweet = async () => {
    try {
      // First check if the tweet document exists
      const tweetRef = doc(db, 'tweets', id);
      const tweetDoc = await getDoc(tweetRef);

      if (!tweetDoc.exists()) {
        console.log('Tweet already deleted or does not exist');
        return;
      }

      const batch = writeBatch(db);

      // Delete the tweet
      batch.delete(tweetRef);

      // If this is a reply, decrement parent tweet's repliesCount
      if (tweet.parentTweet && tweet.parentTweet !== "") {
        // Check if parent tweet exists before updating it
        const parentTweetRef = doc(db, 'tweets', tweet.parentTweet);
        const parentTweetDoc = await getDoc(parentTweetRef);

        if (parentTweetDoc.exists()) {
          if (tweet.isQuoteTweet) {
            batch.update(parentTweetRef, {
              quotesCount: increment(-1)
            });

            // Also remove from parent's quotes subcollection
            batch.delete(doc(db, 'tweets', tweet.parentTweet, 'quotes', id));
          // Otherwise, this is a "reply" tweet.
          } else {
            batch.update(parentTweetRef, {
              repliesCount: increment(-1)
            });

            // Also remove from parent's replies subcollection
            batch.delete(doc(db, 'tweets', tweet.parentTweet, 'replies', id));
          }
        }
      }

      await batch.commit();

      // Redirect to home page if we're on the deleted tweet's page
      if (router.query.id === id) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };


  /**
   * @description - Opens the image modal to show the full-screen view of the tweet image.
   */
  const handleImageClick = (e: React.MouseEvent, imageIndex: number = 0) => {
    e.stopPropagation();
    setSelectedImageIndex(imageIndex);
  };

  /**
   * @description - Closes the image modal.
   */
  const handleCloseImageModal = () => {
    setSelectedImageIndex(null);
  };

  // Check if the tweet has been edited at least once.
  const editedTweet = tweet?.versionHistory && tweet.versionHistory.length > 0;

  /**
   * Get simplified reply status text and icon
   */
  const getReplyStatus = () => {
    const allowRepliesFrom = tweet?.allowRepliesFrom || ['everybody'];

    // If replies are hidden, show as disabled regardless of other settings
    if (tweet?.hideReplies) {
      return {
        text: 'Replies disabled',
        icon: XCircleIcon
      };
    }

    if (allowRepliesFrom.includes('everybody')) {
      return {
        text: 'Everyone can reply',
        icon: GlobeIcon
      };
    } else if (allowRepliesFrom.includes('nobody')) {
      return {
        text: 'Replies disabled',
        icon: XCircleIcon
      };
    } else {
      return {
        text: 'Some people can reply',
        icon: UserGroupIcon
      };
    }
  };

  /**
   * Handle click on interaction settings text
   */
  const handleInteractionClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If user is the author of the tweet, show edit modal
    if (session?.user?.uid === authorId) {
      setEditInteractionSettingsTweet({
        tweetId: id,
        allowQuotes: tweet?.allowQuotes ?? true,
        allowRepliesFrom: tweet?.allowRepliesFrom ?? ['everybody']
      } as any);
      setEditInteractionSettingsModalOpen(true);
    } else {
      // Otherwise show info modal for non-authors
      setShowReplyInfoModal(true);
    }
  };

  return (
    <>
      {/* In this component, there are two ways a tweet will be shown:
      - As a tweet in a page where we are on the page of that tweet and show the thread of replies below the tweet as well as other detailed info like the specific time it was posted, device it was posted on, and the exact stats of each action (replies, retweets, likes, bookmarks)
      - As a tweet in a list where we WON'T see any of the more detailed info and will see the simplified version of it with the author and the content of the tweet. */}
      {!tweetPage && !showFullView ? (
        !loading && author ? (
          // This is the SIMPLE tweet where we won't see as much detailed information (like a thread of replies) but ONLY the content of the tweet and the author.
          <div className={`${theme} max-w-full text-base ${showParentTweetConnectingLine ? 'p-3 pb-6' : 'p-3'} w-full ${!topParentTweet && !showParentTweetConnectingLine ? 'border-b border-[#AAB8C2]  dark:border-gray-700' : ''}`}>
            <SmallTweet {...{
              retweetedBy,
              session,
              author,
              showParentTweetConnectingLine,
              tweet,
              editedTweet,
              pastTweet,
              id,
              authorId,
              deleteTweet,
              parentTweet,
              parentTweetAuthor,
              isQuoteTweet,
              replyingToDeletedTweet,
              handleImageClick,
              likesCount,
              retweetsCount,
              bookmarksCount,
              repliesCount,
              liked,
              retweeted,
              bookmarked,
              setLiked,
              setRetweeted,
              setBookmarked,
              tweetID,
            }} />
          </div>
        ) : null
      ) : (
        !loading && author ? (
          // This shows the other view, the FULL-SIZED Tweet when it's on it's own page.
          <BigTweet {...{
            session,
            author,
            showParentTweetConnectingLine,
            tweet,
            editedTweet,
            pastTweet,
            id,
            authorId,
            deleteTweet,
            parentTweet,
            parentTweetAuthor,
            isQuoteTweet,
            replyingToDeletedTweet,
            handleImageClick,
            likesCount,
            retweetsCount,
            bookmarksCount,
            repliesCount,
            liked,
            retweeted,
            bookmarked,
            setLiked,
            setRetweeted,
            setBookmarked,
            isReplyTweetWithConnectedLine,
            handleInteractionClick,
            getReplyStatus
          }} />
        ) : null
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        images={tweet.images && tweet.images.length > 0 ? tweet.images : []}
        initialIndex={selectedImageIndex ?? 0}
        onClose={handleCloseImageModal}
      />

      {/* Reply Info Modal */}
      <ReplyInfoModal
        isOpen={showReplyInfoModal}
        onClose={() => setShowReplyInfoModal(false)}
        allowRepliesFrom={tweet?.allowRepliesFrom}
        hideReplies={tweet?.hideReplies}
      />

      {/* Delete Tweet Confirmation Modal */}
      <DeleteTweetModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteTweet}
      />
    </>
  );
};

export default Tweet;