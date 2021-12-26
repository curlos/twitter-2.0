import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name?: string;
      email?: string;
      profilePic?: string;
      image?: string;
      banner?: string;
      tag?: string;
      uid?: string;
      bio?: string;
      location?: string;
      website?: string;
      dateJoined?: object;
    }
  }
}