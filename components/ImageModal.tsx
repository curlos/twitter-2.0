import React, { useState, useEffect, useRef } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

/**
 * Get the common arrow button classes with position-specific class
 */
export const getArrowButtonClasses = (position: 'left' | 'right') => {
  const baseClasses = "absolute top-1/2 transform -translate-y-1/2 z-10 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all bg-lightblue-500";
  const positionClass = position === 'left' ? 'left-4' : 'right-4';
  return `${baseClasses} ${positionClass}`;
};

/**
 * Common icon classes for chevron arrows
 */
export const chevronIconClasses = "h-5 w-5";

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Custom left arrow for the carousel
 */
const CustomLeftArrow = ({ onClick, ...rest }: any) => {
  const { onMove } = rest;
  return (
    <button
      className={getArrowButtonClasses('left')}
      onClick={() => onClick()}
      disabled={onMove}
    >
      <ChevronLeftIcon className={chevronIconClasses} />
    </button>
  );
};

/**
 * Custom right arrow for the carousel
 */
const CustomRightArrow = ({ onClick, ...rest }: any) => {
  const { onMove } = rest;
  return (
    <button
      className={getArrowButtonClasses('right')}
      onClick={() => onClick()}
      disabled={onMove}
    >
      <ChevronRightIcon className={chevronIconClasses} />
    </button>
  );
};

/**
 * Reusable image modal component for displaying images in a carousel
 */
const ImageModal = ({ isOpen, images, initialIndex = 0, onClose }: ImageModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(initialIndex);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    setCurrentSlide(initialIndex);
    if (carouselRef.current && isOpen) {
      carouselRef.current.goToSlide(initialIndex);
    }
  }, [initialIndex, isOpen]);

  // Handle scrollbar management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToSlide = (slideIndex: number) => {
    if (carouselRef.current) {
      carouselRef.current.goToSlide(slideIndex);
      setCurrentSlide(slideIndex);
    }
  };

  if (!isOpen || !images || images.length === 0) return null;

  // For single image, show simple modal
  if (images.length === 1) {
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
            src={images[0]}
            alt=""
            className="max-h-[100vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  const responsive = {
    all: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-70"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-20 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-white hover:bg-opacity-20 hover:text-white transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <XIcon className="h-6 w-6" />
      </button>

      <div className="h-full flex flex-col">
        {/* Main carousel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <Carousel
              ref={carouselRef}
              responsive={responsive}
              infinite={false}
              keyBoardControl={true}
              customLeftArrow={<CustomLeftArrow onClick={() => {}} />}
              customRightArrow={<CustomRightArrow onClick={() => {}} />}
              showDots={false}
              removeArrowOnDeviceType={[]}
              containerClass="h-full"
              itemClass="flex items-center justify-center h-full px-4"
              sliderClass="h-full"
              afterChange={(_previousSlide, { currentSlide }) => {
                setCurrentSlide(currentSlide);
              }}
            >
              {images.map((image, index) => (
                <div key={index} className="h-full flex items-center justify-center">
                  <img
                    src={image}
                    alt=""
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="p-4 bg-black bg-opacity-50">
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 p-1 ${currentSlide === index ? 'border-2 border-lightblue-500' : 'border-2 border-transparent'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
              >
                <img
                  src={image}
                  alt=""
                  className="w-16 h-16 object-cover opacity-70 hover:opacity-100 transition-opacity"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;