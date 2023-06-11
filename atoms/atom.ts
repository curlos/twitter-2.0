/** Similar to useState, using an "atom" will let us manage the state of a specific variable. We will subscribe to this variable and anytime a change is made here, it is then reflected in every component that has subscribed to this "atom" */
/** So the purpose of this "atom.ts" file is to setup all the different states that this project will be using in one file. These are all the different states that will be used in MANY components/files so prop-drilling can be avoided as much as possible. Stuff like the modals or the theme color (light or dark) which could potentially appear in many pages would require this. */
import { atom } from 'recoil';

// Used to detect if a "New Tweet" modal is open. Meaning that the user is trying to make a new tweet and they're drafting it up using the modal. There's another way to make a new tweet (through the "Home" input which is automatically open on the top of the user's feed)
export const newTweetModalState = atom({
  key: "newTweetModalState",
  default: false,
});

// Used to detect if the "Edit Settings" modal is open. It's actually really just the modal that lets a user edit their profile where they can change their profile banner, pic, name, username, bio, location and website.
export const editProfileModalState = atom({
  key: "editProfileModalState",
  default: false,
});

// Used to detect if the "Search" modal is open. This modal allows the user to type in whatever they want and filter the tweets shown to them by this query.
export const searchModalState = atom({
  key: "searchModalState",
  default: false,
});

// This is the sidebar modal that is shown when a user clicks the "Settings" (Cog icon) on mobile.
export const sidenavState = atom({
  key: "sidenavState",
  default: false,
});

// This is used to interact between the "NewTweetModal" and "Tweet" components. The reason it needs to be set in here is because a user can create a new tweet in 2 ways (as of now): Create a brand new tweet with no previous context OR Create a brand new tweet where the user is REPLYING to an existing tweet.
export const tweetBeingRepliedToIdState = atom({
  key: "tweetBeingRepliedToIdState",
  default: '',
});

// This is used to detect what theme the user picked. Right now there are only two options: 'light' and 'dark'. Depending on the option the user picked, different CSS classes will be used. If they picked 'light', the white colors will be used for backgrounds and black colors used for text. If they picked 'dark', the black colors will be for the backgrounds and the white colors for the text.
export const colorThemeState = atom({
  key: "colorThemeState",
  default: 'dark'
});

// Used for editing tweets but haven't fully established this quite yet so still a work-in-progress.
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