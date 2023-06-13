import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { newTweetModalState, editTweetState } from "../atoms/atom";
import { Menu, Transition } from "@headlessui/react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { IAuthor, ITweet } from "../utils/types";
import { collection, doc, DocumentData, getDoc, onSnapshot } from "@firebase/firestore";
import { db } from "../firebase";
import { useFollow } from "../utils/useFollow";

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
  const [_user, setUser] = useState<DocumentData>();
  const [followers, setFollowers] = useState<DocumentData>();
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const [_editTweetInfo, setEditTweetInfo] = useRecoilState(editTweetState);

  useEffect(() => {
    // Creating a reference to the document in Firestore.
    // The document is located in the "users" collection and has an ID of authorId.
    const docRef = doc(db, "users", authorId);

    // Retrieving the document from Firestore. This returns a promise.
    getDoc(docRef).then((snap) => {
      // Finish handling the promise and we recieve a DocumentSnapshot (snap).

      // Calling the .data() method on the DocumentSnapshot to extract the data
      // as a JavaScript object. This data represents the user document from Firestore.
      setUser(snap.data());

      // Updating a piece of state to indicate that the loading of the data is complete.
      setLoading(false);
    });

    // The second argument to useEffect is an array of depedencies.
    // When any value in this array changes, the effect callback will run agin
    // Here it will fetch the new user document whenever the authorId changes.
  }, [authorId]);

  useEffect(() => {
    // onSnapshot is a Firestore method that sets up a real-time listener on a document or collection.
    // When the document or collection changes, onSnapshot calls a callback function with a snapshot of the updated data.
    // Here, the snapshot is being used to set the state of followers using the setFollowers function.

    // collection(db, 'users', authorId, 'followers') is getting a reference to the 'followers' subcollection
    // of the docuent with ID authorId in the 'users' collection.
    // This can be read as "the 'followers' of the user with ID authorId".
    onSnapshot(collection(db, 'users', authorId, 'followers'), (snapshot) =>
      // Set the followers of the author whose tweet is being clicked on to show the dropdown.
      setFollowers(snapshot.docs)
    );

    // The effect depends on db, authorId, and loading.
    // This means that the code inside the effect will re-run whenever any of these three value changes.
    // db is the Firestore database.
    // authorId is the ID of the author whose followers we're interested in.
    // loading is not used inside the effect, but its changes still cause the effect to re-run.
  }, [db, authorId, loading]);

  useEffect(() => {
    // If we've managed to get the followers for this tweet's author
    if (followers) {
      // Check if the currently logged in user (if any) is following the author of this tweet and set the status here. If they follow the author of this tweet, then "followed" = true, else, "followed" = false.
      setFollowed(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1);
    }

    // TODO - Not sure we really loading here as NO API call is made. Might be able to remove but will have to test it out first.
    setLoading(false);
  }, [followers]);


  /**
   * @description - Handles what happens when a user wants to follow or unfollow someone.
   * @returns {Object || undefined}
   */
  const handleFollow = useFollow({ session, followed, db, userID: authorId });

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
                  className="absolute right-0 w-56 mt-2 origin-top-right divide-y rounded-md shadow-gray-500 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
                >

                  <div className="py-1 bg-white dark:bg-black rounded-md divide-gray-400 dark:divide-gray-700">
                    {/* Only show this if the tweet DOES NOT belong to the currently logged in user (if any) */}
                    {!loading && session && session.user && author.tag !== session.user.tag ? (
                      <Menu.Item onClick={handleFollow}>
                        {({ active }) => (
                          <div
                            className={`bg-white dark:bg-black text-black dark:text-white w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:bg-gray-900 z-50`}
                          >
                            {/* After we get the data from firebase, either 'Follow' or 'Unfollow' will be shown depending on if the logged in user (if any) is currently in the list of followers of the tweet's author. */}
                            {!followed ? `Follow` : 'Unfollow'} @{author.tag}
                          </div>
                        )}
                      </Menu.Item>
                    ) : null}

                    {/* This option will only be shown if the tweet belongs to the currently logged in user (meaning if it belongs to the same person who clicked to show the dropdown). If the "Edit" button here is clicked, then the user will be prompted with the Edit Tweet flow where they will be shown a modal with the current tweet's text and/or image (s). */}
                    {session && session.user && author.tag === session.user.tag && (
                      <Menu.Item onClick={() => {
                        // console.log(tweet);
                        // debugger;
                        setIsOpen(true);
                        setEditTweetInfo({
                          image: tweet?.image,
                          ...tweet
                        });
                      }}>
                        {({ active }) => (
                          <div
                            className={`bg-white dark:bg-black w-full px-4 py-2 text-sm leading-5 text-left text-gray-400 hover:bg-gray-900 cursor-pointer`}
                          >
                            Edit
                          </div>
                        )}
                      </Menu.Item>
                    )}

                    {/* This option will only be shown if the tweet belongs to the currently logged in user (meaning if it belongs to the same person who clicked to show the dropdown). If the "Delete" button here is clicked, then the tweet will be deleted. */}
                    {session && session.user && author.tag === session.user.tag && (
                      <Menu.Item onClick={deleteTweet}>
                        {({ active }) => (
                          <div
                            className={`bg-white dark:bg-black w-full px-4 py-2 text-sm leading-5 text-left text-red-500 hover:bg-gray-900 cursor-pointer`}
                          >
                            Delete
                          </div>
                        )}
                      </Menu.Item>
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
