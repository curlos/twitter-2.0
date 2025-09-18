import { DocumentData } from 'firebase/firestore';

export const sortByNewestFollowers = (usersToSort: DocumentData[]) => {
  const usersToSortClone = [...usersToSort];

  return usersToSortClone.sort((userOne, userTwo) => {
    const userOneData = userOne.data ? userOne.data() : userOne;
    const userTwoData = userTwo.data ? userTwo.data() : userTwo;

    const timestampOne = userOneData.followedAt?.seconds || 0;
    const timestampTwo = userTwoData.followedAt?.seconds || 0;

    return timestampOne > timestampTwo ? -1 : 1;
  });
};

export const sortByOldestFollowers = (usersToSort: DocumentData[]) => {
  const usersToSortClone = [...usersToSort];

  return usersToSortClone.sort((userOne, userTwo) => {
    const userOneData = userOne.data ? userOne.data() : userOne;
    const userTwoData = userTwo.data ? userTwo.data() : userTwo;

    const timestampOne = userOneData.followedAt?.seconds || 0;
    const timestampTwo = userTwoData.followedAt?.seconds || 0;

    return timestampOne > timestampTwo ? 1 : -1;
  });
};

export const sortByMostFollowers = (usersToSort: DocumentData[]) => {
  const usersToSortClone = [...usersToSort];

  return usersToSortClone.sort((userOne, userTwo) => {
    // For this sorting, we need to get the actual user data, not the follower document
    // The user data should be fetched and attached to each user object
    const userOneFollowersCount = userOne.userData?.followersCount || 0;
    const userTwoFollowersCount = userTwo.userData?.followersCount || 0;

    return userTwoFollowersCount - userOneFollowersCount;
  });
};

export const sortByMostFollowing = (usersToSort: DocumentData[]) => {
  const usersToSortClone = [...usersToSort];

  return usersToSortClone.sort((userOne, userTwo) => {
    // For this sorting, we need to get the actual user data, not the follower document
    // The user data should be fetched and attached to each user object
    const userOneFollowingCount = userOne.userData?.followingCount || 0;
    const userTwoFollowingCount = userTwo.userData?.followingCount || 0;

    return userTwoFollowingCount - userOneFollowingCount;
  });
};