import React, { useState } from 'react';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { colorThemeState, authModalState, editInteractionSettingsModalState, editInteractionSettingsTweetState } from '../../atoms/atom';
import { doc, writeBatch, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TweetDropdown } from '../TweetDropdown';
import { FaRetweet } from 'react-icons/fa';
import { HiBadgeCheck } from 'react-icons/hi';
import { BsPencilFill } from 'react-icons/bs';
import NumberFlow from '@number-flow/react';
import Link from 'next/link';
import TweetActions from './TweetActions';
import useTweetData from './useTweetData';
import ImageModal from '../ImageModal';
import { PhotographIcon, ChevronRightIcon, GlobeIcon, XCircleIcon, UserGroupIcon } from '@heroicons/react/solid';
import ParentTweet from '../ParentTweet';
import ReplyInfoModal from './ReplyInfoModal';
import DeleteTweetModal from './DeleteTweetModal';

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

      // Redirect to home page after successful deletion
      router.push('/');
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

  const renderTweetContent = () => (
    <div>
      {/* Check if the tweet was retweeted by a user and display a message at the top if they did like: "Cristiano Ronaldo retweeted" */}
      <div className="text-gray-500 text-sm">{retweetedBy ? (
        <div className="font-semibold ml-[63px]">
          <Link href={`/profile/${retweetedBy.tag}`}>
            <span className="flex hover:underline">
              <FaRetweet className="h-[18px] w-[18px] mr-2 mb-2" />
              <span className="truncate max-w-[200px]">
                {session && session.user && retweetedBy.tag === session.user.tag ? 'You retweeted' : `${retweetedBy.name} retweeted`}
              </span>
            </span>
          </Link>
        </div>
      ) : null}</div>
      <div className="flex relative">
        {/* Profile pic */}
        <div className="mr-2 relative">
          <Link href={`/profile/${author.tag}`}>
            <img src={author.profilePic} alt={`${author.tag}'s profile pic`} className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer" />
          </Link>
          {showParentTweetConnectingLine && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[55px] bottom-[-24px] w-0.5 bg-gray-400 dark:bg-gray-600"></div>
          )}
        </div>

        <div className="flex flex-col justify-between w-full">
          {/* List of information about the tweet at the top - Author name, author username, verified user badge, timestamp, whether it's been edited or not. */}
          <div className="flex justify-between w-full">
            <div className="lg:flex">
              <div className="flex">
                <Link href={`/profile/${author.tag}`}>
                  <div className="cursor-pointer hover:underline font-bold truncate max-w-[200px]">{author.name}</div>
                </Link>
                <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
              </div>
              <Link href={`/profile/${author.tag}`}>
                <div className="text-gray-500 cursor-pointer hover:underline">@{author.tag}</div>
              </Link>
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
          <div className="pb-1">
            {parentTweet && parentTweetAuthor && !isQuoteTweet && (
              <div className="text-[15px] text-gray-500">
                Replying to
                <Link href={`/profile/${parentTweetAuthor.tag}`}>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">
                    @{parentTweetAuthor.tag}
                  </span>
                </Link>
              </div>
            )}

            {replyingToDeletedTweet && (
              <div className="text-xl w-full">
                <div className="text-[15px] text-gray-500">
                  <span>Replying to</span>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@deleted</span>
                </div>
              </div>
            )}

            <div className={`${pastTweet ? ' text-gray-500' : ''} ${getLongestWord().length > 26 ? 'break-all' : 'break-words'}`} style={{ whiteSpace: 'pre-line' }}>{tweet.text}</div>
            {(tweet.images && tweet.images.length > 0) ? (
              <div className="pt-3">
                {tweet.images.length === 1 ? (
                  <img
                    src={tweet.images[0]}
                    alt=""
                    className="rounded-2xl max-h-[500px] w-full object-contain border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => handleImageClick(e, 0)}
                  />
                ) : tweet.images.length === 2 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {tweet.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt=""
                        className={`w-full aspect-[1/1] object-cover border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity ${
                          index === 0 ? 'rounded-l-2xl' : 'rounded-r-2xl'
                        }`}
                        onClick={(e) => handleImageClick(e, index)}
                      />
                    ))}
                  </div>
                ) : tweet.images.length === 3 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <img
                      src={tweet.images[0]}
                      alt=""
                      className="rounded-l-2xl w-full h-full object-cover border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => handleImageClick(e, 0)}
                    />
                    <div className="flex flex-col gap-2">
                      <img
                        src={tweet.images[1]}
                        alt=""
                        className="rounded-tr-2xl w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => handleImageClick(e, 1)}
                      />
                      <img
                        src={tweet.images[2]}
                        alt=""
                        className="rounded-br-2xl w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => handleImageClick(e, 2)}
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
                          className={`w-full aspect-[3/2] object-cover border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity ${
                            index === 0 ? 'rounded-tl-2xl' :
                            index === 1 ? 'rounded-tr-2xl' :
                            index === 2 ? 'rounded-bl-2xl' :
                            'rounded-br-2xl'
                          }`}
                          onClick={(e) => handleImageClick(e, index)}
                        />
                        {index === 3 && tweet.images.length > 4 && (
                          <div className={`absolute bottom-3 right-3 bg-gray-900 hover:bg-black rounded-lg px-4 py-2 cursor-pointer transition-all flex items-center gap-2 border border-gray-400 dark:border-gray-700`} onClick={(e) => handleImageClick(e, 0)}>
                            <PhotographIcon className="h-5 w-5 text-white" />
                            <span className="text-white text-lg font-bold">+{tweet.images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : tweet.image && (
              <div className="pt-3">
                <img
                  src={tweet.image}
                  alt=""
                  className="rounded-2xl max-h-[500px] object-contain border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => handleImageClick(e, 0)}
                />
              </div>
            )}
          </div>
          
          {isQuoteTweet && tweet.parentTweet && (
            <div className="mt-3">
              <ParentTweet tweetBeingRepliedToId={tweet.parentTweet} isQuoteTweet={true} />
            </div>
          )}

          {/* Action buttons */}
          <TweetActions
            id={id}
            likesCount={likesCount}
            retweetsCount={retweetsCount}
            bookmarksCount={bookmarksCount}
            repliesCount={repliesCount}
            liked={liked}
            retweeted={retweeted}
            bookmarked={bookmarked}
            session={session}
            pastTweet={pastTweet}
            tweet={tweet}
            tweetAuthorId={authorId}
            onLikeChange={setLiked}
            onRetweetChange={setRetweeted}
            onBookmarkChange={setBookmarked}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* In this component, there are two ways a tweet will be shown:
      - As a tweet in a page where we are on the page of that tweet and show the thread of replies below the tweet as well as other detailed info like the specific time it was posted, device it was posted on, and the exact stats of each action (replies, retweets, likes, bookmarks)
      - As a tweet in a list where we WON'T see any of the more detailed info and will see the simplified version of it with the author and the content of the tweet. */}
      {!tweetPage && !showFullView ? (
        !loading && author ? (
          // This is the SIMPLE tweet where we won't see as much detailed information (like a thread of replies) but ONLY the content of the tweet and the author.
          <div className={`${theme} max-w-full text-base ${showParentTweetConnectingLine ? 'p-3 pb-6' : 'p-3'} w-full ${!pastTweet ? 'cursor-pointer' : ''} ${!topParentTweet && !showParentTweetConnectingLine ? 'border-b border-[#AAB8C2]  dark:border-gray-700' : ''}`}>
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
          <div className={`text-base border-b border-[#AAB8C2] dark:border-gray-700 w-full ${isReplyTweetWithConnectedLine ? 'p-3 pt-0' : 'p-3'}`}>

            {/* Top of the tweet where the information about it's author is shown.  */}
            <div className="flex justify-between">
              <div className="flex">
                <Link href={`/profile/${author.tag}`}>
                  <div className="mr-2 relative">
                    <img src={author.profilePic} alt={`${author.tag}'s profile pic`} className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer" />
                    {showParentTweetConnectingLine && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-[55px] bottom-[-24px] w-0.5 bg-gray-400 dark:bg-gray-600"></div>
                    )}
                  </div>
                </Link>

                <div className="">
                  <Link href={`/profile/${author.tag}`}>
                    <div className="flex">
                      <div className="cursor-pointer hover:underline font-bold truncate max-w-[200px]">{author.name}</div>
                      <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] text-lightblue-500" />
                    </div>
                  </Link>
                  <Link href={`/profile/${author.tag}`}>
                    <div className="text-gray-700 dark:text-gray-400 p-0 m-0 cursor-pointer hover:underline">@{author.tag}</div>
                  </Link>
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
            {replyingToDeletedTweet && (
              <div className="text-xl w-full">
                <div className="text-[15px] text-gray-500">
                  <span>Replying to</span>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@deleted</span>
                </div>
              </div>
            )}

            <div className="text-xl pt-3 w-full">
              {/* Renders a message saying that this tweet is a reply to another one with the parent tweet's author's username in the message. For example, "Replying to @wojespn" */}
              {parentTweet && parentTweetAuthor && !isQuoteTweet ? (
                <div className="text-[15px] text-gray-500">
                  <span>Replying to</span>
                  <Link href={`/profile/${parentTweetAuthor.tag}`}>
                    <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">
                      @{parentTweetAuthor.tag}
                    </span>
                  </Link>
                </div>
              ) : null}

              {/* Main content of the tweet - Renders both the text AND image(s) in the tweet. */}
              <div className="break-all" style={{ whiteSpace: 'pre-line' }}>{tweet.text}</div>
              {(tweet.images && tweet.images.length > 0) ? (
                <div className="pt-3">
                  {tweet.images.length === 1 ? (
                    <img
                      src={tweet.images[0]}
                      alt=""
                      className="rounded-2xl w-full object-contain border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => handleImageClick(e, 0)}
                    />
                  ) : tweet.images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {tweet.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt=""
                          className={`w-full aspect-[1/1] object-cover border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity ${
                            index === 0 ? 'rounded-l-2xl' : 'rounded-r-2xl'
                          }`}
                          onClick={(e) => handleImageClick(e, index)}
                        />
                      ))}
                    </div>
                  ) : tweet.images.length === 3 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <img
                        src={tweet.images[0]}
                        alt=""
                        className="rounded-l-2xl w-full h-full object-cover border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => handleImageClick(e, 0)}
                      />
                      <div className="flex flex-col gap-2">
                        <img
                          src={tweet.images[1]}
                          alt=""
                          className="rounded-tr-2xl w-full aspect-[3/2] object-cover border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => handleImageClick(e, 1)}
                        />
                        <img
                          src={tweet.images[2]}
                          alt=""
                          className="rounded-br-2xl w-full aspect-[3/2] object-cover border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => handleImageClick(e, 2)}
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
                            className={`w-full aspect-[3/2] object-cover border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity ${
                              index === 0 ? 'rounded-tl-2xl' :
                              index === 1 ? 'rounded-tr-2xl' :
                              index === 2 ? 'rounded-bl-2xl' :
                              'rounded-br-2xl'
                            }`}
                            onClick={(e) => handleImageClick(e, index)}
                          />
                          {index === 3 && tweet.images.length > 4 && (
                            <div className={`absolute bottom-3 right-3 bg-gray-900 hover:bg-black rounded-lg px-4 py-2 cursor-pointer transition-all flex items-center gap-2 border border-gray-400 dark:border-gray-700`} onClick={(e) => handleImageClick(e, 0)}>
                              <PhotographIcon className="h-5 w-5 text-white" />
                              <span className="text-white text-lg font-bold">+{tweet.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : tweet.image && (
                <div className="pt-3">
                  <img
                    src={tweet.image}
                    alt=""
                    className="rounded-2xl w-full object-contain border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => handleImageClick(e, 0)}
                  />
                </div>
              )}
            </div>

            {isQuoteTweet && tweet.parentTweet && (
              <div className="mt-3">
                <ParentTweet tweetBeingRepliedToId={tweet.parentTweet} isQuoteTweet={true} />
              </div>
            )}

            <div className="divide-y divide-gray-700">
              <div className="py-4">
                {/* Desktop layout: everything in one row */}
                <div className="hidden sm:flex items-center gap-1">
                  <div className={`flex gap-1 ${editedTweet ? 'cursor-pointer' : ''}`} onClick={() => {
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
                    </span>
                  </div>

                  <div className="text-gray-500 font-bold">·</div>
                  <div className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1" onClick={handleInteractionClick}>
                    {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
                    {getReplyStatus().text}
                  </div>
                </div>

                {/* Mobile layout: timestamp row and interaction row separate */}
                <div className="sm:hidden">
                  <div className={`flex gap-1 mb-2 ${editedTweet ? 'cursor-pointer' : ''}`} onClick={() => {
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
                    </span>
                  </div>

                  <div className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1" onClick={handleInteractionClick}>
                    {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
                    {getReplyStatus().text}
                  </div>
                </div>
              </div>

              {/* Row of stats for each different action: Replies, Retweets, Likes - Hidden for past tweets */}
              {!pastTweet && (
                <div className="flex space-x-4 py-4">
                  <div className="space-x-1">
                    <span className="font-bold">{repliesCount}</span>
                    <span className="text-gray-500">Replies</span>
                  </div>

                  <div className="space-x-1">
                    <NumberFlow
                      value={retweetsCount}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Retweets</span>
                  </div>

                  <div className="space-x-1">
                    <NumberFlow
                      value={likesCount}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Likes</span>
                  </div>

                  <div className="space-x-1">
                    <NumberFlow
                      value={bookmarksCount}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Bookmarks</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <TweetActions
                id={id}
                likesCount={likesCount}
                retweetsCount={retweetsCount}
                bookmarksCount={bookmarksCount}
                repliesCount={repliesCount}
                liked={liked}
                retweeted={retweeted}
                bookmarked={bookmarked}
                session={session}
                fullSize={true}
                pastTweet={pastTweet}
                tweet={tweet}
                tweetAuthorId={authorId}
                onLikeChange={setLiked}
                onRetweetChange={setRetweeted}
                onBookmarkChange={setBookmarked}
              />

              <div className="flex justify-end">
                <button
                  className="flex items-center gap-1 text-gray-500 hover:text-lightblue-500 transition-colors duration-200 pt-2 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/tweet/${id}/activity`);
                  }}
                >
                  View quotes and activity
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        images={tweet.images && tweet.images.length > 0 ? tweet.images : tweet.image ? [tweet.image] : []}
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