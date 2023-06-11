import { BadgeCheckIcon } from '@heroicons/react/solid';
import React from 'react';

/**
 * @description - Renders a user to follow. Will show the user's profile pic, name, and username. There'll be a follow button for the currently logged in user to click.
 * @returns {React.FC}
 */
const SmallUser = () => {
  return (
    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-3">
      <div className="flex items-center space-x-2">
        <img src="/assets/profile_icon.jpeg" alt="" className="rounded-full h-[55px] w-[55px] object-cover" />

        {/* TODO: Currently have it setup as a Lakers account but this doesn't actually exist so I'll need to change it to a real user on the site. Will probably leave it as one of the last things to do since I tend to purge a lot of accounts. */}
        <div>
          <div className="flex">
            <div>Los Angeles Lakers</div>
            <BadgeCheckIcon className="h-5 w-5 text-lightblue-500" />
          </div>

          <div className="text-gray-400">
            @Lakers
          </div>
        </div>
      </div>

      {/* TODO: When I get a real user setup permanently then this should have the "handleFollow" functionality instead of doing nothing as it is right now. */}
      <div>
        <button className="py-2 px-3 bg-white text-sm text-black font-bold rounded-full">Follow</button>
      </div>
    </div>
  );
};

export default SmallUser;
