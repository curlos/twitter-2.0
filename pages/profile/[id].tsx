import { getDocs, onSnapshot } from '@firebase/firestore';
import { useSession } from 'next-auth/react';
import Router, { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { db } from "../../firebase";
import { useRecoilState } from 'recoil';
import { editProfileModalState } from '../../atoms/atom';
import AppLayout from '../../components/Layout/AppLayout';
import PageHeader from '../../components/Layout/PageHeader';
import ContentContainer from '../../components/Layout/ContentContainer';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { collection, orderBy, query, where, documentId } from 'firebase/firestore';
import { CalendarIcon, LinkIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import ProfileTweets from '../../components/ProfileTweets';
import moment from 'moment';
import TweetSkeletonLoader from '../../components/TweetSkeletonLoader';
import Link from 'next/link';
import AuthReminder from '../../components/AuthReminder';
import { useFollow } from '../../utils/useFollow';
import EditProfileModal from '../../components/EditProfileModal';
import ImageModal from '../../components/ImageModal';

const ProfileHeader = ({ author, session, id, followed, handleEditOrFollow, followersYouFollow }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <div>
        <img
          src={author.banner || "/assets/profile_banner.jpg"}
          alt=""
          className="w-full max-h-[225px] object-cover cursor-pointer"
          onClick={() => handleImageClick(author.banner || "/assets/profile_banner.jpg")}
        />
      </div>

      <div className="flex justify-between items-start p-4 pb-0">
        <img
          src={author.profilePic}
          alt=""
          className="rounded-full h-[133.5px] w-[133.5px] border-4 border-white dark:border-black mt-[-88px] object-cover cursor-pointer"
          onClick={() => handleImageClick(author.profilePic)}
        />

        <div className="flex items-center space-x-2">
          <div className="flex justify-center items-center p-2 px-4 border-2 border-[#AAB8C2] dark:border-gray-700 rounded-full cursor-pointer" onClick={handleEditOrFollow}>
            {session && session.user && session.user.tag === String(id) ? 'Edit Profile' : (followed ? 'Following' : 'Follow')}
          </div>
        </div>
      </div>

      <div className="p-4 pt-2">
        <div className="flex items-center">
          <h2 className="text-xl font-[900]">{author.name}</h2>
          <BadgeCheckIcon className="h-5 w-5 text-lightblue-500" />
        </div>

        <div className="text-base text-gray-500">@{author.tag}</div>

        <div className="text-base">{author.bio}</div>

        <div className="flex text-base text-gray-500 space-x-4 py-2">
          {author.location ? (
            <div className="flex text-gray-500 space-x-1">
              <LocationMarkerIcon className="h-5 w-5" />
              <div className="">{author.location}</div>
            </div>
          ) : null}

          {author.website ? (
            <div className="flex space-x-1">
              <LinkIcon className="h-5 w-5" />
              <a href={`${!author.website.includes('https://') ?
                `https://${author.website}` : author.website}`} target="_blank" className="text-lightblue-400 hover:underline">{author.website}</a>
            </div>
          ) : null}

          <div className="flex space-x-1">
            <CalendarIcon className="h-5 w-5" />
            <div className="">Joined {moment(new Date(author.dateJoined.seconds * 1000)).format('MMMM YYYY')}</div>
          </div>

        </div>

        <div className="text-gray-500 text-base flex space-x-4">
          <Link href={{
            pathname: `/following/[tag]`,
            query: { tag: author.tag || 't' }
          }}>
            <div className="space-x-1 cursor-pointer hover:underline">
              <span className="text-black dark:text-white font-bold">{author.followingCount ?? 0}</span>
              <span>Following</span>
            </div>
          </Link>


          <Link href={{
            pathname: `/followers/[tag]`,
            query: { tag: author.tag || 't' }
          }}>
            <div className="space-x-1 cursor-pointer hover:underline">
              <span className="text-black dark:text-white font-bold">{author.followersCount ?? 0}</span>
              <span>Followers</span>
            </div>
          </Link>
        </div>

        {followersYouFollow && followersYouFollow.length ? (
          <div className="text-sm text-gray-500 flex space-x-3 py-3">
            <div className="flex">
              {followersYouFollow.slice(0, 3).map((user, i) => (
                <Link key={user.tag} href={`/profile/${user.tag}`}>
                  <img src={user.profilePic} alt="" className={`h-[18px] w-[18px] cursor-pointer border border-white rounded-full z-50 ${i > 0 ? 'ml-[-9px]' : ''}`} />
                </Link>
              ))}
            </div>
            <div>
              Followed by {followersYouFollow.slice(0, 3).map((follower, i) => (
                <span key={`follower-${follower.tag}`}>
                  <Link href={`/profile/${follower.tag}`}>
                    <span className="cursor-pointer hover:underline">{follower.name}
                    </span>
                  </Link>
                  <span>
                    {i === followersYouFollow.slice(0, 3).length - 1 ? '' : ', '}
                  </span>
                </span>

              ))} {followersYouFollow.length > followersYouFollow.slice(0, 3).length ? `, and ${followersYouFollow.length - followersYouFollow.slice(0, 3).length} ${(followersYouFollow.length - followersYouFollow.slice(0, 3).length) > 1 ? 'others' : 'other'} you follow` : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        images={selectedImage ? [selectedImage] : []}
        onClose={handleCloseImageModal}
      />
    </>
  );
};

const ProfilePage = () => {
  const { data: session } = useSession();
  const [isSettingsModalOpen, setSettingsModalOpen] = useRecoilState(editProfileModalState);
  const [loading, setLoading] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const [filter, setFilter] = useState('Tweets');
  const [author, setAuthor] = useState(null);
  const [authorID, setAuthorID] = useState('');
  const [tweets, setTweets] = useState([]);
  const [retweets, setRetweets] = useState([]);
  const [likes, setLikes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followersYouFollow, setFollowersYouFollow] = useState([]);

  const [followed, setFollowed] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return; // Wait for router to populate id

    setLoading(true);

    const fetchFromDB = async () => {
      const userQuery = query(collection(db, "users"), where('tag', '==', id));
      const userQuerySnapshot = await getDocs(userQuery);

      setAuthor(userQuerySnapshot.docs[0].data());
      setAuthorID(userQuerySnapshot.docs[0].id);
      setLoading(false);
    };
    fetchFromDB();
  }, [db, id]);

  useEffect(() => {
    if (!loading) {
      setTweetsLoading(true);

      // Keep tweets real-time (core Twitter experience)
      const tweetsQuery = query(collection(db, "tweets"),
        where('userID', '==', authorID),
        orderBy('timestamp', 'desc')
      );
      const unsubscribeTweets = onSnapshot(tweetsQuery, (snapshot) => {
        setTweets(snapshot.docs);
        setTweetsLoading(false);
      });

      // Convert retweets and likes to periodic updates (less critical)
      const fetchRetweetsAndLikes = async () => {
        try {
          const retweetsQuery = query(collection(db, 'users', authorID, 'retweets'));
          const retweetsSnapshot = await getDocs(retweetsQuery);
          setRetweets(retweetsSnapshot.docs);

          const likesQuery = query(collection(db, 'users', authorID, 'likes'));
          const likesSnapshot = await getDocs(likesQuery);
          setLikes(likesSnapshot.docs);
        } catch (error) {
          console.error('Error fetching retweets/likes:', error);
        }
      };

      // Initial fetch
      fetchRetweetsAndLikes();

      // Periodic updates every 60 seconds for retweets/likes
      const interval = setInterval(fetchRetweetsAndLikes, 60000);

      return () => {
        unsubscribeTweets();
        clearInterval(interval);
      };
    }
  }, [db, id, loading, filter]);

  // Check if current user is following this profile (efficient single document check)
  useEffect(() => {
    if (!loading && session?.user?.uid && authorID) {
      const checkFollowStatus = async () => {
        try {
          const followDoc = await getDocs(query(
            collection(db, 'users', authorID, 'followers'),
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
  }, [db, authorID, loading, session?.user?.uid]);

  // Only fetch followers collection when logged in AND viewing someone else's profile (for "Followed by" logic)
  useEffect(() => {
    if (!loading && session?.user?.uid && authorID && session.user.tag !== String(id)) {
      const unsubscribeFollowers = onSnapshot(collection(db, 'users', authorID, 'followers'), (snapshot) => setFollowers(snapshot.docs));
      return () => unsubscribeFollowers();
    } else {
      setFollowers([]);
    }
  }, [db, id, loading, session?.user?.uid, authorID]);

  // Only fetch "Followed by" data when logged in AND viewing someone else's profile
  useEffect(() => {
    if (!loading && session?.user?.uid && author && session.user.tag !== String(id) && followers.length > 0) {
      const fetchFollowersYouFollow = async () => {
        try {
          // First get the list of users the current session user is following
          const followingSnapshot = await getDocs(collection(db, 'users', session.user.uid, 'following'));
          const followingUserIds = followingSnapshot.docs.map(doc => doc.id);

          if (followingUserIds.length === 0) {
            setFollowersYouFollow([]);
            return;
          }

          // Batch query to get all user data at once (Firebase 'in' operator supports up to 10 items)
          const batchedUserData = [];
          const batchSize = 10;

          for (let i = 0; i < followingUserIds.length; i += batchSize) {
            const batch = followingUserIds.slice(i, i + batchSize);
            const usersQuery = query(
              collection(db, "users"),
              where(documentId(), 'in', batch)
            );
            const usersSnapshot = await getDocs(usersQuery);
            const batchData = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            batchedUserData.push(...batchData);
          }

          // Filter for shared followers
          const sharedFollowers = batchedUserData.filter((user) =>
            user.tag !== author.tag && isUserFollowing(user, followers)
          );

          setFollowersYouFollow(sharedFollowers);
        } catch (error) {
          console.error('Error fetching followers you follow:', error);
          setFollowersYouFollow([]);
        }
      };

      // Initial fetch
      fetchFollowersYouFollow();

      // Periodic updates every 30 seconds (non-critical data doesn't need real-time)
      const interval = setInterval(fetchFollowersYouFollow, 30000);

      return () => clearInterval(interval);
    } else {
      setFollowersYouFollow([]);
    }
  }, [db, id, loading, session?.user?.uid, followers, author]);


  const isUserFollowing = (user, followers) => {
    const result = followers.every((follower) => {
      return follower.data().followedBy !== user.id;
    });

    return !result;
  };

  /**
   * @description - Handles what happens when a user wants to follow or unfollow someone.
   * @returns {Object || undefined}
   */
  const handleFollow = useFollow({ session, followed, db, userID: authorID });

  const handleEditOrFollow = async () => {
    if (!session) {
      Router.push('/auth');
      return;
    }

    if (session.user.tag === String(id)) {
      setSettingsModalOpen(true);
    } else {
      // Update follow state immediately for better UX (optimistic update)
      const newFollowedState = !followed;
      setFollowed(newFollowedState);

      try {
        await handleFollow();
        // Refetch author data to get updated follower/following counts from Firebase
        const userQuery = query(collection(db, "users"), where('tag', '==', id));
        const userQuerySnapshot = await getDocs(userQuery);
        if (!userQuerySnapshot.empty) {
          setAuthor(userQuerySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error updating follow:', error);
        // Revert follow state on error
        setFollowed(followed);
      }
    }
  };

  return (
    <AppLayout title={author ? `${author.name} (@${author.tag}) / Twitter 2.0` : "Profile / Twitter 2.0"}>
      <ContentContainer loading={loading}>
        {author && (
          <>
            <PageHeader
              title={
                <div className="flex items-center">
                  {author.name}
                  <BadgeCheckIcon className="h-6 w-6 text-lightblue-500 ml-1" />
                </div>
              }
              subtitle={`${tweets.length} Tweets`}
              showBackButton={true}
              backPath="/"
            >
              <AuthReminder />
            </PageHeader>

            <ProfileHeader
              author={author}
              session={session}
              id={id}
              followed={followed}
              handleEditOrFollow={handleEditOrFollow}
              followersYouFollow={followersYouFollow}
            />

            <FilterTabs filter={filter} setFilter={setFilter} />

            <div className="w-full h-[1px] m-0 bg-gray-700 rounded-full"
            />

            {tweetsLoading ? (
              <div>
                {Array.from({ length: 10 }, (_, index) => (
                  <TweetSkeletonLoader key={index} />
                ))}
              </div>
            ) : (
              <ProfileTweets author={author} tweets={tweets} retweets={retweets} likes={likes} filter={filter} />
            )}
          </>
        )}
        {isSettingsModalOpen && <EditProfileModal />}
      </ContentContainer>
    </AppLayout>
  );
};

const FilterTabs = ({ filter, setFilter }) => {
  const tabs = ['Tweets', 'Tweets & Replies', 'Media', 'Likes'];

  return (
    <div className="flex">
      {tabs.map((tab) => (
        <div
          key={tab}
          className="flex flex-grow flex-col items-center text-base text-gray-500 mr-2 ml-2 cursor-pointer"
          onClick={() => setFilter(tab)}
        >
          <div className={`${filter === tab && 'text-black dark:text-white font-bold'} flex-1 py-2 flex justify-center items-center`}>
            {tab}
          </div>
          {filter === tab ? (
            <div className="w-full h-1 m-0 bg-lightblue-400 rounded-full" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;
