/** Similar to useState, using an "atom" will let us manage the state of a specific variable. We will subscribe to this variable and anytime a change is made here, it is then reflected in every component that has subscribed to this "atom" */
/** So the purpose of this "atom.ts" file is to setup all the different states that this project will be using in one file. These are all the different states that will be used in MANY components/files so prop-drilling can be avoided as much as possible. Stuff like the modals or the theme color (light or dark) which could potentially appear in many pages would require this. */
import { atom } from 'recoil';

// HMR-safe atom creation to prevent duplicate key errors during development
const createSafeAtom = (config) => {
  return atom({
    ...config,
    key: process.env.NODE_ENV === 'development'
      ? `${config.key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : config.key
  });
};

// Used to detect if a "New Tweet" modal is open. Meaning that the user is trying to make a new tweet and they're drafting it up using the modal. There's another way to make a new tweet (through the "Home" input which is automatically open on the top of the user's feed)
export const newTweetModalState = createSafeAtom({
  key: "newTweetModalState",
  default: false,
});

// Used to detect if the "Edit Settings" modal is open. It's actually really just the modal that lets a user edit their profile where they can change their profile banner, pic, name, username, bio, location and website.
export const editProfileModalState = createSafeAtom({
  key: "editProfileModalState",
  default: false,
});

// Used to detect if the "Search" modal is open. This modal allows the user to type in whatever they want and filter the tweets shown to them by this query.
export const searchModalState = createSafeAtom({
  key: "searchModalState",
  default: false,
});

// This is the sidebar modal that is shown when a user clicks the "Settings" (Cog icon) on mobile.
export const sidenavState = createSafeAtom({
  key: "sidenavState",
  default: false,
});

// This is used to interact between the "NewTweetModal" and "Tweet" components. The reason it needs to be set in here is because a user can create a new tweet in 2 ways (as of now): Create a brand new tweet with no previous context OR Create a brand new tweet where the user is REPLYING to an existing tweet.
export const tweetBeingRepliedToIdState = createSafeAtom({
  key: "tweetBeingRepliedToIdState",
  default: '',
});

// This is used to detect what theme the user picked. Right now there are only two options: 'light' and 'dark'. Depending on the option the user picked, different CSS classes will be used. If they picked 'light', the white colors will be used for backgrounds and black colors used for text. If they picked 'dark', the black colors will be for the backgrounds and the white colors for the text.
export const colorThemeState = createSafeAtom({
  key: "colorThemeState",
  default: 'dark'
});

// Used for editing tweets but haven't fully established this quite yet so still a work-in-progress.
export const editTweetState = createSafeAtom({
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

// Used to detect if the "Auth" modal is open. This modal appears when non-logged in users try to perform actions that require authentication.
export const authModalState = createSafeAtom({
  key: "authModalState",
  default: false,
});

// Used to detect if the "Edit Interaction Settings" modal is open. This modal allows users to edit who can interact with their tweets.
export const editInteractionSettingsModalState = createSafeAtom({
  key: "editInteractionSettingsModalState",
  default: false,
});

// Used to store the tweet data for editing interaction settings.
export const editInteractionSettingsTweetState = createSafeAtom({
  key: "editInteractionSettingsTweetState",
  default: {
    tweetId: '',
    allowQuotes: true,
    allowRepliesFrom: ['everybody'] // can be 'everybody', 'following', 'followers', or combinations
  }
});

// Used to detect if we are currently quote tweeting. This helps track whether the user is creating a quote tweet.
export const isQuoteTweetState = createSafeAtom({
  key: "isQuoteTweetState",
  default: false,
});