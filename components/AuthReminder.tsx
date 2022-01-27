import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const AuthReminder = () => {
  const { data: session } = useSession()

  if (session) {
    return null
  }

  return (
    <div className="flex gap-3 py-3">
      <Link href="/auth">
        <div className="flex-1 text-center bg-lightblue-500 text-white rounded-full p-1 cursor-pointer">Log in</div>
      </Link>

      <Link href="/auth">
        <div className="flex-1 text-center border border-gray-700 rounded-full p-1 cursor-pointer text-black dark:text-white">Sign up</div>
      </Link>
    </div>
  )
};

export default AuthReminder;
