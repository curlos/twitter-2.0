import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

/**
 * @description - Users can see the site WITHOUT being logged in. When this happens this "reminder" will be shown at the top of the feed (list of tweets) telling the user they can still either log in or sign up.
 * @returns {React.FC}
 */
const AuthReminder = () => {
  const { data: session } = useSession();

  // If the user has a "session", it must mean that they are logged in and have an account which means this reminder would not have to be shown.
  if (session) {
    return null;
  }

  return (
    <div className="flex gap-3 py-3">
      <Link href="/auth">
        <div className="flex-1 text-center bg-lightblue-500 text-white rounded-full p-1 cursor-pointer">Log In</div>
      </Link>

      <Link href="/auth?sign-up=true">
        <div className="flex-1 text-center border border-gray-700 rounded-full p-1 cursor-pointer text-black dark:text-white">Sign Up</div>
      </Link>
    </div>
  );
};

export default AuthReminder;
