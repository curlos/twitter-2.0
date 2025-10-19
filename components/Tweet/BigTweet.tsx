import { PhotographIcon, ChevronRightIcon } from "@heroicons/react/solid";
import NumberFlow from "@number-flow/react";
import moment from "moment";
import Link from "next/link";
import router from "next/router";
import React from "react";
import { BsPencilFill } from "react-icons/bs";
import { HiBadgeCheck } from "react-icons/hi";
import ParentTweet from "../ParentTweet";
import { TweetDropdown } from "../TweetDropdown";
import TweetActions from "./TweetActions";

const BigTweet = ({
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
}) => {
  const getLongestWord = () => {
    if (!tweet.text) {
      return '';
    } else {
      return tweet.text.split(' ').reduce((a, b) => a.length > b.length ? a : b);
    }
  };

  return (
    <div
      className={`text-base border-b border-[#AAB8C2] dark:border-gray-700 w-full ${isReplyTweetWithConnectedLine ? "p-3 pt-0" : "p-3"}`}
    >
      {/* Top of the tweet where the information about it's author is shown.  */}
      <TweetTopGeneralInfo {...{ author, showParentTweetConnectingLine, pastTweet, tweet, id, authorId, deleteTweet }} />

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
              <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline">@{parentTweetAuthor.tag}</span>
            </Link>
          </div>
        ) : null}

        {/* Main content of the tweet - Renders both the text AND image(s) in the tweet. */}
        <div className={getLongestWord().length > 26 ? "break-all" : "break-words"} style={{ whiteSpace: "pre-line" }}>
          {tweet.text}
        </div>
        
        <TweetImages {...{ tweet, handleImageClick }} />
      </div>

      {isQuoteTweet && tweet.parentTweet && (
        <div className="mt-3">
          <ParentTweet tweetBeingRepliedToId={tweet.parentTweet} isQuoteTweet={true} />
        </div>
      )}

      <div className="divide-y divide-gray-700">
        <TweetBottomGeneralInfo {...{ editedTweet, id, tweet, handleInteractionClick, getReplyStatus }} />

        {/* Row of stats for each different action: Replies, Retweets, Likes - Hidden for past tweets */}
        {!pastTweet && (
          <div className="flex space-x-4 py-4">
            <div className="space-x-1">
              <span className="font-bold">{repliesCount}</span>
              <span className="text-gray-500">Replies</span>
            </div>

            <div className="space-x-1">
              <NumberFlow value={retweetsCount} className="font-bold" />
              <span className="text-gray-500">Retweets</span>
            </div>

            <div className="space-x-1">
              <NumberFlow value={likesCount} className="font-bold" />
              <span className="text-gray-500">Likes</span>
            </div>

            <div className="space-x-1">
              <NumberFlow value={bookmarksCount} className="font-bold" />
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
  );
};

const TweetTopGeneralInfo = ({ author, showParentTweetConnectingLine, pastTweet, tweet, id, authorId, deleteTweet }) => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <Link href={`/profile/${author.tag}`}>
          <div className="mr-2 relative">
            <img
              src={author.profilePic}
              alt={`${author.tag}'s profile pic`}
              className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer"
            />
            {showParentTweetConnectingLine && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-[55px] bottom-[-24px] w-0.5 bg-gray-400 dark:bg-gray-600"></div>
            )}
          </div>
        </Link>

        <div className="">
          <Link href={`/profile/${author.tag}`}>
            <div className="flex">
              <div className="cursor-pointer hover:underline font-bold truncate max-w-[200px]">{author.name}</div>
              <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] mt-[2px] text-lightblue-500" />
            </div>
          </Link>
          <Link href={`/profile/${author.tag}`}>
            <div className="text-gray-700 dark:text-gray-400 p-0 m-0 cursor-pointer hover:underline">
              @{author.tag}
            </div>
          </Link>
        </div>
      </div>

      {/* Dropdown where different actions can be seen - Hidden for past tweets */}
      {!pastTweet && (
        <TweetDropdown
          tweet={{
            ...tweet,
            tweetId: id,
          }}
          author={author}
          authorId={authorId}
          deleteTweet={deleteTweet}
        />
      )}
    </div>
  )
}

const TweetBottomGeneralInfo = ({ editedTweet, id, tweet, handleInteractionClick, getReplyStatus }) => {
  return (
    <div className="py-4">
      {/* Desktop layout: everything in one row */}
      <div className="hidden sm:flex items-center gap-1">
        <div
          className={`flex gap-1 ${editedTweet ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (editedTweet) {
              router.push(`/tweet/${id}/history`);
            }
          }}
        >
          {/* If the tweet has been edited, the last edited time will be displayed and if the link is clicked, the user will be redirected to the tweet version history page. */}
          {editedTweet && <BsPencilFill className="h-[18px] w-[18px] ml-[2px] text-gray-500 mr-1" />}
          <span className={`flex gap-1 border-b border-transparent${editedTweet ? " hover:border-gray-500" : ""}`}>
            {editedTweet && <div className="text-gray-500">Last edited</div>}
            <div className="text-gray-500">
              {tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format("LT") : "Just now"}
            </div>
            <div className="text-gray-500 font-bold">·</div>
            <div className="text-gray-500">
              {tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format("ll") : "Today"}
            </div>
          </span>
        </div>

        <div className="text-gray-500 font-bold">·</div>
        <div
          className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1"
          onClick={handleInteractionClick}
        >
          {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
          {getReplyStatus().text}
        </div>
      </div>

      {/* Mobile layout: timestamp row and interaction row separate */}
      <div className="sm:hidden">
        <div
          className={`flex gap-1 mb-2 ${editedTweet ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (editedTweet) {
              router.push(`/tweet/${id}/history`);
            }
          }}
        >
          {/* If the tweet has been edited, the last edited time will be displayed and if the link is clicked, the user will be redirected to the tweet version history page. */}
          {editedTweet && <BsPencilFill className="h-[18px] w-[18px] ml-[2px] text-gray-500 mr-1" />}
          <span className={`flex gap-1 border-b border-transparent${editedTweet ? " hover:border-gray-500" : ""}`}>
            {editedTweet && <div className="text-gray-500">Last edited</div>}
            <div className="text-gray-500">
              {tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format("LT") : "Just now"}
            </div>
            <div className="text-gray-500 font-bold">·</div>
            <div className="text-gray-500">
              {tweet.timestamp?.seconds ? moment(tweet.timestamp.seconds * 1000).format("ll") : "Today"}
            </div>
          </span>
        </div>

        <div
          className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1"
          onClick={handleInteractionClick}
        >
          {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
          {getReplyStatus().text}
        </div>
      </div>
    </div>
  )
}

const TweetImages = ({ tweet, handleImageClick }) => {
  return (
    <>
      {tweet.images && tweet.images.length > 0 && (
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
                    index === 0 ? "rounded-l-2xl" : "rounded-r-2xl"
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
                      index === 0
                        ? "rounded-tl-2xl"
                        : index === 1
                          ? "rounded-tr-2xl"
                          : index === 2
                            ? "rounded-bl-2xl"
                            : "rounded-br-2xl"
                    }`}
                    onClick={(e) => handleImageClick(e, index)}
                  />
                  {index === 3 && tweet.images.length > 4 && (
                    <div
                      className={`absolute bottom-3 right-3 bg-gray-900 hover:bg-black rounded-lg px-4 py-2 cursor-pointer transition-all flex items-center gap-2 border border-gray-400 dark:border-gray-700`}
                      onClick={(e) => handleImageClick(e, 0)}
                    >
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
    </>
  )
}

export default BigTweet;