import React, { useState } from 'react';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { newTweetModalState, tweetBeingRepliedToIdState, colorThemeState } from '../../atoms/atom';
import { deleteDoc, doc } from '@firebase/firestore';
import { db } from '../../firebase';
import { TweetDropdown } from '../TweetDropdown';
import { FaRetweet } from 'react-icons/fa';
import { HiBadgeCheck } from 'react-icons/hi';
import { BsPencilFill } from 'react-icons/bs';
import { XIcon } from '@heroicons/react/solid';
import NumberFlow from '@number-flow/react';
import Link from 'next/link';
import TweetActions from './TweetActions';
import useTweetData from './useTweetData';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const router = useRouter();

  // Use the custom hook for tweet data management
  const {
    likes,
    retweets,
    bookmarks,
    replies,
    liked,
    retweeted,
    bookmarked,
    parentTweet,
    parentTweetAuthor,
    authorId,
    author,
    retweetedBy,
    loading
  } = useTweetData(id, tweet, tweetID);

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
   * @description - Opens the image modal to show the full-screen view of the tweet image.
   */
  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowImageModal(true);
    document.body.style.overflow = 'hidden';
  };

  /**
   * @description - Closes the image modal and restores scrolling.
   */
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = 'unset';
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
          <div className="pb-1">
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
                <img
                  src={tweet.image}
                  alt=""
                  className="rounded-2xl max-h-[500px] object-contain border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleImageClick}
                />
              </div>
            )}
          </div>

          {/* Action buttons - Hidden for past tweets */}
          {!pastTweet && (
            <TweetActions
              id={id}
              tweet={tweet}
              replies={replies}
              retweets={retweets}
              likes={likes}
              bookmarks={bookmarks}
              liked={liked}
              retweeted={retweeted}
              bookmarked={bookmarked}
              session={session}
              setTweetBeingRepliedToId={setTweetBeingRepliedToId}
              setIsOpen={setIsOpen}
            />
          )}
        </div>
      </div>
    </div>
  );


  return (
    <>
      {/* In this component, there are two ways a tweet will be shown:
      - As a tweet in a page where we are on the page of that tweet and show the thread of replies below the tweet as well as other detailed info like the specific time it was posted, device it was posted on, and the exact stats of each action (replies, retweets, likes, bookmarks)
      - As a tweet in a list where we WON'T see any of the more detailed info and will see the simplified version of it with the author and the content of the tweet. */}
      {!tweetPage ? (
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
                  <img
                    src={tweet.image}
                    alt=""
                    className="rounded-2xl w-full object-contain border border-[#AAB8C2] dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  />
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
                </span>

                <div className="text-gray-500 font-bold">·</div>
                <div className="text-gray-500">Twitter for Web</div>
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
                    <NumberFlow
                      value={retweets.length}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Retweets</span>
                  </div>

                  <div className="space-x-1">
                    <NumberFlow
                      value={likes.length}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Likes</span>
                  </div>

                  <div className="space-x-1">
                    <NumberFlow
                      value={bookmarks.length}
                      className="font-bold"
                    />
                    <span className="text-gray-500">Bookmarks</span>
                  </div>
                </div>
              )}

              {/* Action buttons - Hidden for past tweets */}
              {!pastTweet && (
                <TweetActions
                  id={id}
                  tweet={tweet}
                  replies={replies}
                  retweets={retweets}
                  likes={likes}
                  bookmarks={bookmarks}
                  liked={liked}
                  retweeted={retweeted}
                  bookmarked={bookmarked}
                  session={session}
                  setTweetBeingRepliedToId={setTweetBeingRepliedToId}
                  setIsOpen={setIsOpen}
                  fullSize={true}
                />
              )}
            </div>
          </div>
        ) : null
      )}

      {/* Image Modal */}
      {showImageModal && tweet.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={handleCloseImageModal}
        >
          <button
            className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-white hover:bg-opacity-20 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseImageModal();
            }}
          >
            <XIcon className="h-6 w-6" />
          </button>
          <div className="relative">
            <img
              src={tweet.image}
              alt=""
              className="max-h-[100vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Tweet;