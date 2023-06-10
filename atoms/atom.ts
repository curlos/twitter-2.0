import { atom } from 'recoil';
import { ITweet } from '../utils/types';

export const newTweetModalState = atom({
  key: "newTweetModalState",
  default: false,
});

export const settingsModalState = atom({
  key: "settingsModalState",
  default: false,
});

export const searchModalState = atom({
  key: "searchModalState",
  default: false,
});

export const sidenavState = atom({
  key: "sidenavState",
  default: false,
});

export const tweetIdState = atom({
  key: "tweetIdState",
  default: '',
});

export const colorThemeState = atom({
  key: "colorThemeState",
  default: 'dark'
});

export const editTweetState = atom({
  key: "editTweetState",
  default: {
    image: '',
    parentTweet: '',
    text: '',
    timestamp: {
      seconds: 0,
      nanoseconds: 0,
    },
    userID: '',
    retweetedBy: '',
    tweetId: ''
  }
});