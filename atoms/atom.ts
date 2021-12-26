import { atom } from 'recoil'

export const newTweetModalState = atom({
  key: "newTweetModalState",
  default: false,
})

export const settingsModalState = atom({
  key: "settingsModalState",
  default: false,
})

export const tweetIdState = atom({
  key: "tweetIdState",
  default: '',
})