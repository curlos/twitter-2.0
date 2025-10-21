import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import React, { useState, Fragment, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useRecoilState } from 'recoil';
import { colorThemeState } from '../atoms/atom';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedImageUrl: string) => void;
  imageType: 'profile' | 'banner';
}

/**
 * @description - Modal component for cropping images with a specific aspect ratio
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @param imageSrc - Source URL of the image to crop
 * @param aspectRatio - Aspect ratio for the crop (e.g., 1 for square, 3 for 3:1)
 * @param onCropComplete - Callback with the cropped image data URL
 * @param imageType - Type of image being cropped (profile or banner)
 */
const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  onCropComplete,
  imageType,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [theme] = useRecoilState(colorThemeState);

  // Reset crop when aspect ratio or image changes
  useEffect(() => {
    setCrop(undefined);
    setCompletedCrop(null);
  }, [aspectRatio, imageSrc]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    // Calculate initial crop centered with correct aspect ratio
    // Start with 90% of image width, then ensure the resulting height fits
    let cropWidth = width * 0.9;
    let cropHeight = cropWidth / aspectRatio;

    // If the calculated height is too tall for the image, constrain by height instead
    if (cropHeight > height * 0.9) {
      cropHeight = height * 0.9;
      cropWidth = cropHeight * aspectRatio;
    }

    setCrop({
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    });
  }, [aspectRatio]);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return Promise.reject(new Error('No 2d context'));
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        }, 'image/jpeg');
      });
    },
    []
  );

  const handleApplyCrop = async () => {
    if (completedCrop && imgRef.current) {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImageUrl);
      onClose();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
        <div className={`${theme}`}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
              <div className="inline-block align-bottom bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-[90vw] lg:w-[50vw]">
                <div className="bg-white dark:bg-black p-3 border-b border-[#AAB8C2] dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XIcon
                        className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-400"
                        onClick={onClose}
                      />
                      <div className="ml-4 text-xl font-bold">
                        Crop {imageType === 'profile' ? 'Profile Picture' : 'Banner'}
                      </div>
                    </div>

                    <div
                      className="bg-white text-black font-bold px-5 py-2 rounded-full cursor-pointer hover:bg-gray-100"
                      onClick={handleApplyCrop}
                    >
                      Apply
                    </div>
                  </div>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                  <ReactCrop
                    key={`${aspectRatio}-${imageSrc}`}
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      style={{ maxHeight: '60vh', maxWidth: '100%' }}
                    />
                  </ReactCrop>
                </div>

                <div className="p-3 bg-white dark:bg-black border-t border-[#AAB8C2] dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Drag the selection to reposition your {imageType === 'profile' ? 'profile picture' : 'banner'}
                  </p>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ImageCropModal;
