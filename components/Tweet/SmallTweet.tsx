import { PhotographIcon } from "@heroicons/react/solid";
import moment from "moment";
import Link from "next/link";
import { BsPencilFill } from "react-icons/bs";
import { FaRetweet } from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi";
import ParentTweet from "../ParentTweet";
import { TweetDropdown } from "../TweetDropdown";
import TweetActions from "./TweetActions";
import { useRouter } from "next/router";

const SmallTweet = ({
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
  getLongestWord,
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
}) => {
  const router = useRouter();

  const handleClick = (e) => {
    if (!pastTweet) {
      e.stopPropagation();
      router.push(`/tweet/${tweetID}`);
    }
  };

  return (
    <div onClick={handleClick} className={!pastTweet ? 'cursor-pointer' : ''}>
      {/* Check if the tweet was retweeted by a user and display a message at the top if they did like: "Cristiano Ronaldo retweeted" */}
      <div className="text-gray-500 text-sm">
        {retweetedBy ? (
          <div className="font-semibold ml-[63px]">
            <Link href={`/profile/${retweetedBy.tag}`}>
              <span className="flex hover:underline" onClick={(e) => e.stopPropagation()}>
                <FaRetweet className="h-[18px] w-[18px] mr-2 mb-2" />
                <span className="truncate max-w-[200px]">
                  {session && session.user && retweetedBy.tag === session.user.tag
                    ? "You retweeted"
                    : `${retweetedBy.name} retweeted`}
                </span>
              </span>
            </Link>
          </div>
        ) : null}
      </div>
      <div className="flex relative">
        {/* Profile pic */}
        <div className="mr-2 relative">
          <Link href={`/profile/${author.tag}`}>
            <img
              src={author.profilePic}
              alt={`${author.tag}'s profile pic`}
              className="rounded-full h-[55px] w-[55px] object-cover max-w-none cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </Link>
          {showParentTweetConnectingLine && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[55px] bottom-[-24px] w-0.5 bg-gray-400 dark:bg-gray-600"></div>
          )}
        </div>

        <div className="flex flex-col justify-between w-full">
          <TweetTopGeneralInfo {...{ author, tweet, editedTweet, pastTweet, id, authorId, deleteTweet }} />

          <div className="pb-1">
            {parentTweet && parentTweetAuthor && !isQuoteTweet && (
              <div className="text-[15px] text-gray-500">
                Replying to
                <Link href={`/profile/${parentTweetAuthor.tag}`}>
                  <span className="ml-1 text-lightblue-400 cursor-pointer hover:underline" onClick={(e) => e.stopPropagation()}>
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

            <div
              className={`${pastTweet ? " text-gray-500" : ""} ${getLongestWord().length > 26 ? "break-all" : "break-words"}`}
              style={{ whiteSpace: "pre-line" }}
            >
              {tweet.text}
            </div>
            
            <TweetImages {...{ tweet, handleImageClick }} />
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
};

const TweetTopGeneralInfo = ({ author, tweet, editedTweet, pastTweet, id, authorId, deleteTweet }) => {
  return (
    <div className="flex justify-between w-full">
      <div className="lg:flex items-center">
        <div className="flex">
          <Link href={`/profile/${author.tag}`}>
            <div className="cursor-pointer hover:underline font-bold truncate max-w-[200px]" onClick={(e) => e.stopPropagation()}>{author.name}</div>
          </Link>
          <HiBadgeCheck className="h-[18px] w-[18px] ml-[2px] mt-[2px] mr-[2px] text-lightblue-500" />
        </div>
        <Link href={`/profile/${author.tag}`}>
          <div className="text-gray-500 cursor-pointer hover:underline" onClick={(e) => e.stopPropagation()}>@{author.tag}</div>
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

const TweetImages = ({ tweet, handleImageClick }) => {
  if (tweet.images && tweet.images.length > 0) {
    return (
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
    )
  }
  
  return (
    tweet.image && (
      <div className="pt-3">
        <img
          src={tweet.image}
          alt=""
          className="rounded-2xl max-h-[500px] object-contain border border-gray-400 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={(e) => handleImageClick(e, 0)}
        />
      </div>
    )
  )
}

export default SmallTweet;