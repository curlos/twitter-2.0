import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FaRetweet, FaQuoteLeft } from 'react-icons/fa';
import DropdownMenuItem from './DropdownMenuItem';

interface RetweetDropdownProps {
  onRetweet: () => void;
  onQuote: () => void;
  children: React.ReactNode;
}

const handleRetweetClick = (e: React.MouseEvent, onRetweet: () => void) => {
  e.stopPropagation();
  onRetweet();
};

const handleQuoteClick = (e: React.MouseEvent, onQuote: () => void) => {
  e.stopPropagation();
  onQuote();
};

const RetweetDropdown: React.FC<RetweetDropdownProps> = ({
  onRetweet,
  onQuote,
  children
}) => {
  return (
    <div className="relative inline-block text-left">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button as="div" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              {children}
            </Menu.Button>

            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute left-0 w-40 mt-2 origin-top-left divide-y rounded-md shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100]"
              >
                <div className="bg-white dark:bg-black rounded-md">
                  <div className="py-1">
                    <DropdownMenuItem
                      icon={FaRetweet}
                      text="Retweet"
                      onClick={(e) => handleRetweetClick(e as React.MouseEvent, onRetweet)}
                      className="text-gray-400"
                    />
                    <DropdownMenuItem
                      icon={FaQuoteLeft}
                      text="Quote"
                      onClick={(e) => handleQuoteClick(e as React.MouseEvent, onQuote)}
                      className="text-gray-400"
                    />
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default RetweetDropdown;