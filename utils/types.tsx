export interface IProvider {
  callbackUrl: string,
  id: string,
  name: string,
  signInUrl: string,
  type: string;
}

export interface ITweet {
  image?: string,
  images?: string[],
  parentTweet: string,
  text: string,
  timestamp: {
    seconds: number,
    nanoseconds: number;
  },
  userID: string,
  retweetedBy: string,
  tweetId: string;
  versionHistory?: Array<ITweet>;
}

export interface IAuthor {
  banner: string | null,
  bio: string | null,
  dateJoined: {
    seconds: number,
    nanoseconds: number;
  },
  email: string,
  location: string | null,
  name: string,
  profilePic: string,
  tag: string,
  updatedAt: {
    seconds: number,
    nanoseconds: number;
  },
  website: string | null,
}