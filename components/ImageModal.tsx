import React from 'react';
import { XIcon } from '@heroicons/react/solid';

interface ImageModalProps {
  isOpen: boolean;
  image: string;
  onClose: () => void;
}

/**
 * Reusable image modal component for displaying images in full-screen
 */
const ImageModal = ({ isOpen, image, onClose }: ImageModalProps) => {
  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-white hover:bg-opacity-20 hover:text-white transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <XIcon className="h-6 w-6" />
      </button>
      <div className="relative">
        <img
          src={image}
          alt=""
          className="max-h-[100vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;