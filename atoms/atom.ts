import { atom } from 'recoil'

export const newTweetModalState = atom({
  key: "newTweetModalState",
  default: false,
})

export const settingsModalState = atom({
  key: "settingsModalState",
  default: true,
})

export const tweetIdState = atom({
  key: "tweetIdState",
  default: '',
})