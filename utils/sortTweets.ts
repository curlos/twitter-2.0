import { DocumentData } from 'firebase/firestore';

export const sortByNewest = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {

    let timestampOne = tweetOne.data().retweetedAt ? tweetOne.data().retweetedAt.seconds : tweetOne.data().timestamp.seconds;

    let timestampTwo = tweetTwo.retweetedAt ? tweetTwo.data().retweetedAt.seconds : tweetTwo.data().timestamp.seconds;

    return timestampOne > timestampTwo ? -1 : 1;
  });
};

export const sortByOldest = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {

    let timestampOne = tweetOne.data().retweetedAt ? tweetOne.data().retweetedAt.seconds : tweetOne.data().timestamp.seconds;

    let timestampTwo = tweetTwo.retweetedAt ? tweetTwo.data().retweetedAt.seconds : tweetTwo.data().timestamp.seconds;

    return timestampOne > timestampTwo ? 1 : -1;
  });
};