import { BadgeCheckIcon } from '@heroicons/react/solid';
import { collection, DocumentData, getDocs, query, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { authModalState } from '../atoms/atom';
import { db } from '../firebase';
import { useFollow } from '../utils/useFollow';

interface Props {
  userID: string,
  user: DocumentData,
}

/**
 * @description - Renders basic information about a user which includes their profile pic, name, username, and their bio. Meant to be viewed in a list of users where you would see basic information about all these users such as when you check the followers of an account.
 * @returns {React.FC}
 */
const MediumUser = ({ userID, user }: Props) => {

  const { data: session } = useSession();
  const [followed, setFollowed] = useState(false);
  const [_authModalOpen, setAuthModalOpen] = useRecoilState(authModalState);

  // Check if current user is following this user (efficient single document check)
  useEffect(() => {
    if (session?.user?.uid && userID) {
      const checkFollowStatus = async () => {
        try {
          const followDoc = await getDocs(query(
            collection(db, 'users', userID, 'followers'),
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
  }, [userID, session?.user?.uid]);

  /**
   *
   * @returns
   */
  const handleFollow = useFollow({ session, followed, db, userID });

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      setAuthModalOpen(true);
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

  return (
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
                <div className="text-gray-700 dark:text-gray-400">@{user.tag}</div>

                <div>{user.bio}</div>
              </div>
            </div>

            {!session || userID !== session.user.uid ? (
              <div className="font-semibold text-sm px-4 py-2 text-black bg-white rounded-full" onClick={handleFollowClick}>{followed ? 'Following' : 'Follow'}</div>
            ) : (
              // If the user is not found (meaning their account has been deleted), then don't render anything.
              null
            )}


          </div>
        </Link>
      ) : null
  );
};

export default MediumUser;