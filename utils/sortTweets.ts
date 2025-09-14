import { DocumentData } from 'firebase/firestore';

export const sortByNewest = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    let timestampOne = tweetOneData.retweetedAt ? tweetOneData.retweetedAt.seconds : tweetOneData.timestamp?.seconds || 0;

    let timestampTwo = tweetTwoData.retweetedAt ? tweetTwoData.retweetedAt.seconds : tweetTwoData.timestamp?.seconds || 0;

    return timestampOne > timestampTwo ? -1 : 1;
  });
};

export const sortByOldest = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    let timestampOne = tweetOneData.retweetedAt ? tweetOneData.retweetedAt.seconds : tweetOneData.timestamp?.seconds || 0;

    let timestampTwo = tweetTwoData.retweetedAt ? tweetTwoData.retweetedAt.seconds : tweetTwoData.timestamp?.seconds || 0;

    return timestampOne > timestampTwo ? 1 : -1;
  });
};