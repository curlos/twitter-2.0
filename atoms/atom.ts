import { atom } from 'recoil';

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
    text: '',
    imageSrc: ''
  }
});