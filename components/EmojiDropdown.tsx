import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EmojiHappyIcon } from '@heroicons/react/outline';
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

interface EmojiDropdownProps {
  onEmojiSelect: (emoji: any) => void;
}

const EmojiDropdown: React.FC<EmojiDropdownProps> = ({ onEmojiSelect }) => {
  return (
    <div className="relative inline-block text-left">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button as="div" className="icon cursor-pointer">
              <EmojiHappyIcon className="h-7 w-7 hoverAnimation" />
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
                className="absolute left-0 mt-2 origin-top-left shadow-gray-800 shadow-lg outline-none border border-[#AAB8C2] dark:border-gray-700 z-[100] rounded-2xl"
              >
                <div className="bg-white dark:bg-black rounded-2xl w-full h-full">
                  <Picker
                    onSelect={onEmojiSelect}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "20px",
                      border: "none"
                    }}
                    theme="dark"
                  />
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default EmojiDropdown;