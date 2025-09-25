import { DocumentData } from 'firebase/firestore';

export const sortByNewest = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    let timestampOne = tweetOneData.retweetedAt ? tweetOneData.retweetedAt.seconds :
      (tweetOneData.timestamp?.seconds ?? Number.MAX_SAFE_INTEGER);

    let timestampTwo = tweetTwoData.retweetedAt ? tweetTwoData.retweetedAt.seconds :
      (tweetTwoData.timestamp?.seconds ?? Number.MAX_SAFE_INTEGER);

    if (timestampOne === timestampTwo) return 0;
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

export const sortByMostLikes = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    const likesOne = tweetOneData.likesCount || 0;
    const likesTwo = tweetTwoData.likesCount || 0;

    return likesTwo - likesOne;
  });
};

export const sortByMostReplies = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    const repliesOne = tweetOneData.repliesCount || 0;
    const repliesTwo = tweetTwoData.repliesCount || 0;

    return repliesTwo - repliesOne;
  });
};

export const sortByMostBookmarks = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    const bookmarksOne = tweetOneData.bookmarksCount || 0;
    const bookmarksTwo = tweetTwoData.bookmarksCount || 0;

    return bookmarksTwo - bookmarksOne;
  });
};

export const sortByMostRetweets = (tweetsToSort: DocumentData[]) => {
  const tweetsToSortClone = [...tweetsToSort];

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    const tweetOneData = tweetOne.data ? tweetOne.data() : tweetOne;
    const tweetTwoData = tweetTwo.data ? tweetTwo.data() : tweetTwo;

    const retweetsOne = tweetOneData.retweetsCount || 0;
    const retweetsTwo = tweetTwoData.retweetsCount || 0;

    return retweetsTwo - retweetsOne;
  });
};