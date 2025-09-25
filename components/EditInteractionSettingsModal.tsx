import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { colorThemeState, editInteractionSettingsModalState, editInteractionSettingsTweetState } from '../atoms/atom';
import { XIcon, CheckIcon } from '@heroicons/react/solid';
import { doc, updateDoc } from '@firebase/firestore';
import { db } from '../firebase';

/**
 * Reusable button component for reply option selection
 */
interface ReplyOptionButtonProps {
  label: string;
  option: string;
  isSelected: boolean;
  onToggle: (option: string, checked: boolean) => void;
  fullWidth?: boolean;
}

const ReplyOptionButton: React.FC<ReplyOptionButtonProps> = ({
  label,
  option,
  isSelected,
  onToggle,
  fullWidth = false
}) => {
  return (
    <button
      onClick={() => onToggle(option, !isSelected)}
      className={`${fullWidth ? 'w-full' : ''} text-gray-500 relative p-2 rounded-lg text-left transition-all ${
        isSelected
          ? 'bg-lightblue-500/40'
          : 'dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-white">{label}</div>
        {isSelected && (
          <div className="flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-lightblue-500" />
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * @description - Modal for editing interaction settings of a tweet (quote and reply permissions)
 * @returns {React.FC}
 */
export const EditInteractionSettingsModal = () => {
  const [isOpen, setIsOpen] = useRecoilState(editInteractionSettingsModalState) as [boolean, (value: boolean) => void];
  const [tweetData, setTweetData] = useRecoilState(editInteractionSettingsTweetState);
  const [theme, _setTheme] = useRecoilState(colorThemeState);

  // Local state for form data
  const [allowQuotes, setAllowQuotes] = useState(true);
  const [allowRepliesFrom, setAllowRepliesFrom] = useState<string[]>(['everybody']);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && tweetData) {
      setAllowQuotes((tweetData as any).allowQuotes ?? true);
      setAllowRepliesFrom((tweetData as any).allowRepliesFrom ?? ['everybody']);
    }
  }, [isOpen, tweetData]);

  const handleClose = () => {
    setIsOpen(false);
    // Reset tweet data
    setTweetData({
      tweetId: '',
      allowQuotes: true,
      allowRepliesFrom: ['everybody']
    } as any);
  };

  const handleXClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleClose();
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleReplyOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      // If "everybody" or "nobody" is selected, clear all other options
      if (option === 'everybody' || option === 'nobody') {
        setAllowRepliesFrom([option]);
      } else {
        // Remove "everybody" and "nobody" if another option is selected, then add the new option
        const newOptions = allowRepliesFrom.filter(opt => opt !== 'everybody' && opt !== 'nobody');
        const finalOptions = [...newOptions, option];
        setAllowRepliesFrom(finalOptions);
      }
    } else {
      // Remove the option
      const newOptions = allowRepliesFrom.filter(opt => opt !== option);
      // If no options left, default to "everybody"
      const finalOptions = newOptions.length > 0 ? newOptions : ['everybody'];
      setAllowRepliesFrom(finalOptions);
    }
  };

  const handleSave = async () => {
    try {
      const tweetId = (tweetData as any)?.tweetId;

      if (!tweetId || tweetId === '') {
        if (tweetData?.handleSettingsChange) {
          tweetData?.handleSettingsChange(allowQuotes, allowRepliesFrom);
        }

        handleClose();
      } else {
        const tweetRef = doc(db, 'tweets', tweetId);
        await updateDoc(tweetRef, {
          allowQuotes,
          allowRepliesFrom
        });
        handleClose();
      }
    } catch (error) {
      console.error('Error saving interaction settings:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-[60] inset-0 overflow-y-auto" onClose={handleClose}>
        <div className={`${theme} flex items-center justify-center min-h-screen p-2 lg:pt-4 lg:px-4 lg:pb-20 text-center sm:block sm:p-0`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle h-screen lg:h-full" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 align-top max-w-lg w-[95vw] lg:w-[50vw] p-6" onClick={handleDialogClick}>
              {/* Header */}
              <div className="bg-white dark:bg-black pb-4 border-b border-[#AAB8C2] dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-black dark:text-white">Edit interaction settings</h2>
                  <XIcon className="h-7 w-7 cursor-pointer text-gray-400 dark:text-white hover:text-gray-500" onClick={handleXClick} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Customize who can interact with this post.</p>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-black py-4 space-y-4">
                {/* Quote Settings */}
                <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Quote settings</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Allow quote tweets</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowQuotes}
                        onChange={(e) => setAllowQuotes(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lightblue-300 dark:peer-focus:ring-lightblue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-lightblue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Reply Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Reply settings</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Allow replies from:</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <ReplyOptionButton
                      label="Everybody"
                      option="everybody"
                      isSelected={allowRepliesFrom.includes('everybody')}
                      onToggle={handleReplyOptionChange}
                    />
                    <ReplyOptionButton
                      label="Nobody"
                      option="nobody"
                      isSelected={allowRepliesFrom.includes('nobody')}
                      onToggle={handleReplyOptionChange}
                    />
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 mb-2">Or combine these options:</p>

                  <div className="space-y-3">
                    <ReplyOptionButton
                      label="Users you follow"
                      option="following"
                      isSelected={allowRepliesFrom.includes('following')}
                      onToggle={handleReplyOptionChange}
                      fullWidth={true}
                    />
                    <ReplyOptionButton
                      label="Your followers"
                      option="followers"
                      isSelected={allowRepliesFrom.includes('followers')}
                      onToggle={handleReplyOptionChange}
                      fullWidth={true}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-white dark:bg-black pt-2 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className="w-full bg-lightblue-500 hover:bg-lightblue-600 text-white font-bold py-3 px-4 rounded-full transition duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};