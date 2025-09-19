import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { newTweetModalState, editTweetState } from "../atoms/atom";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";
import { ClockIcon, PencilIcon, TrashIcon, UserAddIcon, UserRemoveIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { IAuthor, ITweet } from "../utils/types";
import { collection, doc, DocumentData, getDoc, getDocs, query, where } from "@firebase/firestore";
import { db } from "../firebase";
import { useFollow } from "../utils/useFollow";
import DropdownMenuItem from "./DropdownMenuItem";

interface Props {
  tweet: ITweet,
  deleteTweet: (e: React.FormEvent) => Promise<void>,
  author: IAuthor,
  authorId: string;
}

/**
 * @description - A dropdown that will be shown when a user clicks the 3 dots on the top-right of a tweet.
 * @returns {React.FC}
 */
export const TweetDropdown = ({ tweet, author, authorId, deleteTweet }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [_user, setUser] = useState<DocumentData>();
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const [_editTweetInfo, setEditTweetInfo] = useRecoilState(editTweetState);

  useEffect(() => {
    let isMounted = true;
    // Creating a reference to the document in Firestore.
    // The document is located in the "users" collection and has an ID of authorId.
    const docRef = doc(db, "users", authorId);

    // Retrieving the document from Firestore. This returns a promise.
    getDoc(docRef).then((snap) => {
      // Finish handling the promise and we recieve a DocumentSnapshot (snap).

      // Calling the .data() method on the DocumentSnapshot to extract the data
      // as a JavaScript object. This data represents the user document from Firestore.
      if (isMounted) {
        setUser(snap.data());

        // Updating a piece of state to indicate that the loading of the data is complete.
        setLoading(false);
      }
    });

    // The second argument to useEffect is an array of depedencies.
    // When any value in this array changes, the effect callback will run agin
    // Here it will fetch the new user document whenever the authorId changes.
    return () => {
      isMounted = false;
    };
  }, [authorId]);

  // Check if current user is following this user (efficient single document check)
  useEffect(() => {
    if (!loading && session?.user?.uid && authorId) {
      const checkFollowStatus = async () => {
        try {
          const followDoc = await getDocs(query(
            collection(db, 'users', authorId, 'followers'),
            where('followedBy', '==', session.user.uid)
          ));
          setFollowed(!followDoc.empty);
        } catch (error) {
          console.error('Error checking follow status:', error);
          setFollowed(false);
        }
      };
      checkFollowStatus();
    } else {
      setFollowed(false);
    }
  }, [db, authorId, loading, session?.user?.uid]);


  /**
   * @description - Handles what happens when a user wants to follow or unfollow someone.
   * @returns {Object || undefined}
   */
  const handleFollow = useFollow({ session, followed, db, userID: authorId });

  const handleFollowClick = async () => {
    if (!session) {
      return;
    }

    // Update follow state immediately for better UX (optimistic update)
    const newFollowedState = !followed;
    setFollowed(newFollowedState);

    try {
      await handleFollow();
    } catch (error) {
      console.error('Error updating follow:', error);
      // Revert follow state on error
      setFollowed(followed);
    }
  };

  // TODO: Currently, when a user that is NOT logged in clicks the three dot button to show more actions for the tweet, the user will see an empty box. That doesn't seem correct. Need to take a look at how the actual site does it. Probably will need to redirect them to the "/auth" page in some manner as the point of this site is to get as many users as possible.
  return (
    <div className="flex items-center justify-center" onClick={(e) => e.preventDefault()}>
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md">
                <Menu.Button className="inline-flex justify-center w-full px-4 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-transparent rounded-md ">
                  <span><DotsHorizontalIcon className="h-5 w-5 text-gray-400 cursor-pointer" /></span>
                </Menu.Button>
              </span>

              {/* This "Transition" component will open up the dropdown with a transition (so it doesn't open up instantly and smoothly opens) */}
              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className="absolute right-0 w-56 mt-2 origin-top-right divide-y rounded-md shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
                >

                  <div className="bg-white dark:bg-black rounded-md">
                    {/* General actions group - available to all users */}
                    <div className="py-1">
                      {/* Follow/Unfollow - only show this if the tweet DOES NOT belong to the currently logged in user (if any) AND we're not on this user's profile page */}
                      {!loading && session && session.user && author.tag !== session.user.tag && router.query.id !== author.tag && (
                        <DropdownMenuItem
                          icon={!followed ? UserAddIcon : UserRemoveIcon}
                          text={!followed ? `Follow @${author.tag}` : `Unfollow @${author.tag}`}
                          onClick={handleFollowClick}
                          className="text-gray-400"
                        />
                      )}

                      {/* Version History - available to all users, only show if tweet has been edited */}
                      {tweet?.versionHistory && tweet.versionHistory.length > 0 && (
                        <DropdownMenuItem
                          icon={ClockIcon}
                          text="View version history"
                          onClick={() => {
                            router.push(`/tweet/${tweet.tweetId}/history`);
                          }}
                          className="text-gray-400"
                        />
                      )}
                    </div>

                    {/* Edit and Delete options - only shown if the tweet belongs to the currently logged in user */}
                    {session && session.user && author.tag === session.user.tag && (
                      <>
                        {/* Divider */}
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>

                        {/* Edit and Delete Group */}
                        <div className="py-1">
                          <DropdownMenuItem
                            icon={PencilIcon}
                            text="Edit"
                            onClick={() => {
                              setIsOpen(true);
                              setEditTweetInfo({
                                image: tweet?.image || '',
                                images: tweet?.images || [],
                                ...tweet
                              });
                            }}
                            className="text-gray-400"
                          />

                          <DropdownMenuItem
                            icon={TrashIcon}
                            text="Delete"
                            onClick={deleteTweet}
                            className="text-red-500"
                          />
                        </div>
                      </>
                    )}

                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};
