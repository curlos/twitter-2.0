import { atom } from 'recoil'

export const newTweetModalState = atom({
  key: "newTweetModalState",
  default: false,
})

export const tweetIdState = atom({
  key: "tweetIdState",
  default: '',
})