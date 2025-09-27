import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import { useRecoilState } from 'recoil';
import { colorThemeState } from '../../atoms/atom';

interface ReplyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowRepliesFrom?: string[];
  hideReplies?: boolean;
}

const ReplyInfoModal: React.FC<ReplyInfoModalProps> = ({
  isOpen,
  onClose,
  allowRepliesFrom = ['everybody'],
  hideReplies = false
}) => {
  const [theme] = useRecoilState(colorThemeState);

  /**
   * Get detailed reply information for info modal
   */
  const getDetailedReplyInfo = () => {
    // If replies are hidden, show as disabled regardless of other settings
    if (hideReplies) {
      return {
        title: 'Replies are disabled',
        description: 'The author has disabled replies for this tweet.'
      };
    }

    if (allowRepliesFrom.includes('everybody')) {
      return {
        title: 'Everyone can reply',
        description: 'Anyone can reply to this tweet.'
      };
    } else if (allowRepliesFrom.includes('nobody')) {
      return {
        title: 'Replies are disabled',
        description: 'The author has disabled replies for this tweet.'
      };
    } else {
      const settings = [];
      if (allowRepliesFrom.includes('following')) {
        settings.push('accounts this user follows');
      }
      if (allowRepliesFrom.includes('followers')) {
        settings.push('accounts that follow this user');
      }

      let description = 'Only ';
      if (settings.length === 1) {
        description += settings[0];
      } else if (settings.length === 2) {
        description += settings[0] + ' and ' + settings[1];
      }
      description += ' can reply to this tweet.';

      return {
        title: 'Some people can reply',
        description
      };
    }
  };

  const replyInfo = getDetailedReplyInfo();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
        <div className={`${theme} flex items-start justify-center min-h-screen pt-16 p-4 text-center`}>
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

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 align-middle max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black dark:text-white">
                  {replyInfo.title}
                </h3>
                <XIcon
                  className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                />
              </div>

              {/* Content */}
              <p className="text-gray-600 dark:text-gray-300">
                {replyInfo.description}
              </p>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ReplyInfoModal;