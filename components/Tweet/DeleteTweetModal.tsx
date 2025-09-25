import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { colorThemeState } from '../../atoms/atom';

interface DeleteTweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteTweetModal: React.FC<DeleteTweetModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [theme] = useRecoilState(colorThemeState);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
        <div className={`${theme} flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center`}>
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
            <div className="inline-block bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all max-w-sm w-full p-6">
              {/* Header */}
              <div className="mb-4">
                <Dialog.Title as="h3" className="text-xl font-bold text-black dark:text-white">
                  Delete this tweet?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    If you remove this tweet, you won't be able to recover it.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full transition duration-200"
                  onClick={handleConfirm}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white font-bold py-3 px-4 rounded-full transition duration-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DeleteTweetModal;