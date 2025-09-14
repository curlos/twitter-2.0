import { BadgeCheckIcon } from '@heroicons/react/solid';
import { collection, deleteDoc, doc, DocumentData, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useFollow } from '../utils/useFollow';
import Spinner from './Spinner';

interface Props {
  userID: string,

}

/**
 * @description - Renders basic information about a user which includes their profile pic, name, username, and their bio. Meant to be viewed in a list of users where you would see basic information about all these users such as when you check the followers of an account.
 * @returns {React.FC}
 */
const MediumUser = ({ userID }: Props) => {

  const { data: session } = useSession();
  const [user, setUser] = useState<DocumentData>();
  const [followers, setFollowers] = useState<DocumentData>();
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the user in the "users" collection
    const docRef = doc(db, "users", userID);

    getDoc(docRef).then((snap) => {
      setUser(snap.data());
      setLoading(false);
    });

    // We'll need different information for different users so this would be called everytime the ID of the user we need information from changes.
  }, [userID]);

  useEffect(() => {
    // Get the followers of this user
    const unsubscribe = onSnapshot(collection(db, 'users', userID, 'followers'), (snapshot) => setFollowers(snapshot.docs));
    return () => unsubscribe();
  }, [db, userID, loading]);

  useEffect(() => {
    if (followers) {
      // Find out if the currently logged in user (if any) is FOLLOWING this user.
      setFollowed(followers.findIndex((follower) => follower.id === session?.user.uid) !== -1);
    }
  }, [followers]);

  /**
   * 
   * @returns 
   */
  const handleFollow = useFollow({ session, followed, db, userID });

  return (
    loading ? <Spinner /> : (
      user ? (
        <Link href={`/profile/${user.tag}`}>
          <div className="p-3 flex justify-between items-center text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="flex gap-2">
              <Link href={`/profile/${user.tag}`}>
                <img src={user.profilePic} alt={user.name} className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer" />
              </Link>

              <div>
                <Link href={`/profile/${user.tag}`}>
                  <div className="flex items-center gap-1 font-semibold cursor-pointer hover:underline">
                    <div>{user.name}</div>
                    <div><BadgeCheckIcon className="h-[18px] w-[18px] text-lightblue-500" /></div>
                  </div>
                </Link>
                <div className="text-gray-400">@{user.tag}</div>

                <div>{user.bio}</div>
              </div>
            </div>

            {!session || userID !== session.user.uid ? (
              <div className="font-semibold text-sm px-4 py-2 text-black bg-white rounded-full" onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}>{followed ? 'Following' : 'Follow'}</div>
            ) : (
              // If the user is not found (meaning their account has been deleted), then don't render anything.
              null
            )}


          </div>
        </Link>
      ) : null
    )
  );
};

export default MediumUser;