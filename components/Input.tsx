import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

const MAX_TWEET_LENGTH = 500;
const MAX_IMAGES = 10;
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  increment,
} from 'firebase/firestore';
import TextareaAutosize from 'react-textarea-autosize';
import {
  PhotographIcon,
  XIcon,
  ExclamationCircleIcon,
  GlobeIcon,
  XCircleIcon,
  UserGroupIcon
} from "@heroicons/react/outline";
import EmojiDropdown from './EmojiDropdown';
import { useSession } from 'next-auth/react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { newTweetModalState, isQuoteTweetState, editInteractionSettingsModalState, editInteractionSettingsTweetState, tweetSentAlertState } from '../atoms/atom';
import Link from 'next/link';
import { ITweet } from '../utils/types';
import CircularProgress from './CircularProgress';
import Spinner from './Spinner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableImageItem from './SortableImageItem';

interface Props {
  tweetToEdit: ITweet;
  isNewReply: boolean;
  isNewQuote: boolean;
  tweetBeingRepliedToId: string;
  setTweetToEdit: any;
  setIsEditing?: (editing: boolean) => void;
  fromModal?: boolean;
}

/**
 * @description - Renders a container for the user to create/edit a tweet. Deals with the content they put into the tweet such as the text, images and/or emojis. Shown at the top of the Feed and the NewTweetModal components.
 * @returns {React.FC}
 */
const Input = ({ tweetToEdit, setTweetToEdit, tweetBeingRepliedToId, isNewReply, isNewQuote, setIsEditing, fromModal }: Props) => {
  const { data: session } = useSession();

  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const filePickerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [compressingImages, setCompressingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const setIsQuoteTweet = useSetRecoilState(isQuoteTweetState);
  const setEditInteractionSettingsModalOpen = useSetRecoilState(editInteractionSettingsModalState);
  const setEditInteractionSettingsTweet = useSetRecoilState(editInteractionSettingsTweetState);
  const setTweetSentAlert = useSetRecoilState(tweetSentAlertState);
  const isEditingTweet = (tweetToEdit && Object.keys(tweetToEdit).length >= 1 && (tweetToEdit?.text?.length > 0 || tweetToEdit?.images?.length > 0));

  // Interaction settings state
  const [allowQuotes, setAllowQuotes] = useState(tweetToEdit?.allowQuotes ?? true);
  const [allowRepliesFrom, setAllowRepliesFrom] = useState<string[]>(tweetToEdit?.allowRepliesFrom ?? ['everybody']);

  /**
   * Get simplified reply status text and icon for new tweet
   */
  const getReplyStatus = () => {
    if (allowRepliesFrom.includes('everybody')) {
      return {
        text: 'Everyone can reply',
        icon: GlobeIcon
      };
    } else if (allowRepliesFrom.includes('nobody')) {
      return {
        text: 'Replies disabled',
        icon: XCircleIcon
      };
    } else {
      return {
        text: 'Some people can reply',
        icon: UserGroupIcon
      };
    }
  };

  /**
   * Handle settings change callback from EditInteractionSettingsModal
   */
  const handleSettingsChange = (newAllowQuotes: boolean, newAllowRepliesFrom: string[]) => {
    setAllowQuotes(newAllowQuotes);
    setAllowRepliesFrom(newAllowRepliesFrom);
  };

  /**
   * Handle click on interaction settings text to open edit modal
   */
  const handleInteractionClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    setEditInteractionSettingsTweet({
      tweetId: '', // Empty for new tweet
      allowQuotes: allowQuotes,
      allowRepliesFrom: allowRepliesFrom,
      isNewTweet: true,
      handleSettingsChange
    } as any);
    setEditInteractionSettingsModalOpen(true);
  };

  useEffect(() => {
    if (!isEditingTweet || !tweetToEdit) {
      setInput('')
      setSelectedFiles([])
      return
    }

    if (tweetToEdit?.text) {
      setInput(tweetToEdit.text);
    }

    if (tweetToEdit?.images && tweetToEdit.images.length > 0) {
      setSelectedFiles(tweetToEdit.images);
    }
  }, [tweetToEdit]);

  const resetCoreStateValues = () => {
    setLoading(false);
    setInput('');
    setSelectedFiles([]);
    setIsOpen(false);
    setIsQuoteTweet(false);

    if (setTweetToEdit) {
      setTweetToEdit(null)
    }
  }

  const sendTweet = async () => {
    // If a tweet is already being sent or there's no text AND no images then DO NOT send tweet
    if (loading || (!input && selectedFiles.length === 0)) return;
    setLoading(true);
    setUploadError('');

    const newTweet = {
      userID: session.user.uid,
      text: input,
      parentTweet: isNewReply || isNewQuote ? tweetBeingRepliedToId : '',
      isQuoteTweet: isNewQuote ? true : false,
      timestamp: serverTimestamp(),
      versionHistory: [],
      allowQuotes: allowQuotes,
      allowRepliesFrom: allowRepliesFrom
    }

    const docRef = await addDoc(collection(db, 'tweets'), newTweet);

    if (isNewReply) {
      const batch = writeBatch(db);

      // Add to replies subcollection
      batch.set(doc(db, "tweets", tweetBeingRepliedToId, "replies", docRef.id), {
        name: session.user.name,
      });

      // Increment repliesCount on parent tweet
      batch.update(doc(db, "tweets", tweetBeingRepliedToId), {
        repliesCount: increment(1)
      });

      await batch.commit();
    } else if (isNewQuote) {
      const batch = writeBatch(db);

      // Add to quotes subcollection
      batch.set(doc(db, "tweets", tweetBeingRepliedToId, "quotes", docRef.id), {
        name: session.user.name,
      });

      // Increment quotesCount on parent tweet
      batch.update(doc(db, "tweets", tweetBeingRepliedToId), {
        quotesCount: increment(1)
      });

      await batch.commit();
    }

    try {
      if (selectedFiles.length > 0) {
        const imageUrls = await uploadImagesAndGetURLs(docRef.id);
        await updateDoc(doc(db, "tweets", docRef.id), {
          images: imageUrls
        });
      }

      resetCoreStateValues()

      // Show success alert
      const message = isNewReply ? 'Your reply was sent' :
                     isNewQuote ? 'Your quote tweet was sent' :
                     'Your tweet was sent';

      setTweetSentAlert({
        isVisible: true,
        tweetId: docRef.id,
        message: message
      });
    } catch (error) {
      // Error is already handled in uploadImagesAndGetURLs
      // Just stop execution here
      return;
    }
  };

  const editTweet = async () => {
    const currentTweet = tweetToEdit;

    // If a tweet is already being sent or there's no text AND no images then DO NOT send tweet
    if (loading || (!input && selectedFiles.length === 0)) return;

    setLoading(true);
    setUploadError('');

    // Enable editing mode to pause onSnapshot updates
    if (setIsEditing) {
      setIsEditing(true);
    }

    // If the image(s) have already been uploaded (meaning they have not been changed since the past version and have URLs as strings)
    const imagesAlreadyUploaded = selectedFiles.length > 0 && selectedFiles.every(file => file.startsWith('http'));
    const hasNewImages = selectedFiles.length > 0 && selectedFiles.some(file => !file.startsWith('http'));
    const updatedObject: any = {
      timestamp: serverTimestamp(),
      allowQuotes: allowQuotes,
      allowRepliesFrom: allowRepliesFrom,
    };

    // If there's text in the tweet
    if (input) {
      updatedObject.text = input;
    }

    if (imagesAlreadyUploaded) {
      updatedObject.images = selectedFiles;
    }

    const { versionHistory, allowRepliesFrom: currentAllowRepliesFrom, timestamp, ...tweetPrimitiveData } = currentTweet
    const currentTweetAllowRepliesFrom = currentAllowRepliesFrom || []
    const currentTweetTimestamp = {...timestamp}

    // Create a clean version of currentTweet without Firebase-specific objects
    const cleanTweetForHistory = {
      ...tweetPrimitiveData,
      allowRepliesFrom: currentTweetAllowRepliesFrom,
      timestamp: currentTweetTimestamp
    };

    if (currentTweet?.versionHistory) {
      updatedObject.versionHistory = [...currentTweet.versionHistory, cleanTweetForHistory];
    } else {
      updatedObject.versionHistory = [cleanTweetForHistory];
    }

    try {
      // If there are images (mix of existing URLs and new uploads)
      if (selectedFiles.length > 0 && (hasNewImages || !imagesAlreadyUploaded)) {
        const imageUrls = await uploadImagesAndGetURLs(currentTweet.tweetId);
        if (imageUrls.length > 0) {
          updatedObject.images = imageUrls;
        }
      }

      await updateDoc(doc(db, "tweets", currentTweet.tweetId), updatedObject);

      // Once we're finished, reset everything back to the defaults and close the modal.
      resetCoreStateValues()

      // Disable editing mode to resume onSnapshot updates
      if (setIsEditing) {
        setIsEditing(false);
      }

      // Show success alert
      setTweetSentAlert({
        isVisible: true,
        tweetId: currentTweet.tweetId,
        message: 'Your tweet was updated'
      });
    } catch (error) {
      // Error is already handled in uploadImagesAndGetURLs
      // Make sure to disable editing mode even on error
      if (setIsEditing) {
        setIsEditing(false);
      }
      // Don't log or propagate the error as it's already handled
      return;
    }
  };

  const uploadImagesAndGetURLs = async (docRefId: string) => {
    const imagesToUpload = [];
    const imageIndexMap = [];

    // Build a map of which images need uploading and their original indices
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      if (file.startsWith('http')) {
        // Already uploaded, keep the URL
        imageIndexMap.push({ index: i, url: file, needsUpload: false });
      } else {
        // Needs upload
        imageIndexMap.push({ index: i, needsUpload: true, uploadIndex: imagesToUpload.length });
        imagesToUpload.push(file);
      }
    }

    // Upload all new images in a single API call
    let uploadedUrls = [];
    if (imagesToUpload.length > 0) {
      try {
        const response = await fetch('/api/upload/tweet-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: imagesToUpload,
            tweetId: docRefId,
            userId: session.user.uid,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          uploadedUrls = data.imageUrls;
        } else {
          setUploadError(data.error || 'Failed to upload images. Please try again.');
          setLoading(false);
          throw new Error('Failed to upload images');
        }
      } catch (error) {
        setUploadError('Failed to upload images. Please try again.');
        setLoading(false);
        throw error;
      }
    }

    // Reconstruct the array in original order
    const imageUrls = imageIndexMap.map(item => {
      if (item.needsUpload) {
        return uploadedUrls[item.uploadIndex];
      } else {
        return item.url;
      }
    });

    return imageUrls;
  };

  const addImageToPost = async (e) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter((file: File) => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((f: File) => f.name).join(', ');
      alert(`The following files are not supported: ${invalidFileNames}\n\nPlease upload only JPG, PNG, or WEBP images.`);
      e.target.value = ''; // Reset the input
      return;
    }

    const totalFiles = selectedFiles.length + files.length;

    if (totalFiles > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images per tweet.`);
      return;
    }

    // Compression options for tweet images
    const compressionOptions = {
      maxSizeMB: 0.2,              // 200KB target
      maxWidthOrHeight: 1600,       // Good for social media
      useWebWorker: true,           // Non-blocking
      initialQuality: 0.7,          // 70% quality
    };

    setCompressingImages(true);

    const filePromises = files.map(async (file) => {
      try {
        // Compress the image
        const compressedFile = await imageCompression(file as File, compressionOptions);

        // Convert compressed file to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => resolve(readerEvent.target.result);
          reader.readAsDataURL(compressedFile);
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => resolve(readerEvent.target.result);
          reader.readAsDataURL(file as Blob);
        });
      }
    });

    Promise.all(filePromises)
      .then(results => {
        setSelectedFiles(prev => [...prev, ...results]);
      })
      .finally(() => {
        setCompressingImages(false);
      });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering images
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedFiles((images) => {
        const oldIndex = images.findIndex(img => img === active.id);
        const newIndex = images.findIndex(img => img === over.id);

        return arrayMove(images, oldIndex, newIndex);
      });
    }
  };

  const addEmoji = (e) => {
    let sym = e.unified.split('-');
    let codesArray = [];
    sym.forEach((el) => codesArray.push('0x' + el));
    let emoji = String.fromCodePoint(...codesArray);
    const newInput = input + emoji;
    if (newInput.length <= MAX_TWEET_LENGTH) {
      setInput(newInput);
    }
  };

  const handleTextChange = (e) => {
    if (e.target.value.length <= MAX_TWEET_LENGTH) {
      setInput(e.target.value);
    } else {
      setInput(e.target.value.slice(0, MAX_TWEET_LENGTH));
    }
  };

  const getButtonObject = () => {
    { !isNewReply ? 'Tweet' : 'Reply'; }

    if (isNewReply) {
      return {
        text: 'Reply',
        function: sendTweet
      };
    } else if (isNewQuote) {
      return {
        text: 'Quote',
        function: sendTweet
      };
    } else if (isEditingTweet) {
      return {
        text: 'Update',
        function: editTweet
      };
    } else {
      return {
        text: 'Tweet',
        function: sendTweet
      };
    }
  };

  return (
    <div className={`w-full relative flex sm:block space-x-2 z-10 border-b border-[#AAB8C2] dark:border-gray-700 ${fromModal ? 'border-none' : ''}`}>
      {(loading || compressingImages) && (
        <div className="absolute inset-0 flex justify-center items-center z-20 bg-white/50 dark:bg-black/50">
          <Spinner />
        </div>
      )}

      {/* Desktop layout - original structure */}
      <div className="hidden sm:flex p-3 sm:space-x-2">
        <Link href={`/profile/${session.user.tag}`}>
          <img src={session.user.profilePic} className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer z-10" />
        </Link>

        <div className="w-full">
          <div className="border-b border-[#AAB8C2] dark:border-gray-700">
            <TextareaAutosize
              value={input}
              onChange={handleTextChange}
              className={`bg-white dark:bg-black text-black dark:text-white outline-none placeholder-gray-400 min-h-[60px] w-full resize-none font-sans text-lg`} placeholder="What's happening?" />

            {selectedFiles.length > 0 && (
              <div className="py-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedFiles}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFiles.map((file, index) => (
                        <SortableImageItem
                          key={file}
                          id={file}
                          image={file}
                          index={index}
                          onRemove={removeImage}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-600 dark:text-red-400 px-3 py-2 rounded mt-2 flex items-start gap-2">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {!loading && !compressingImages && (
            <div>
              {/* Interaction settings display - only show for new tweets, not edits */}
              <div className="flex items-center gap-1 py-2 border-t border-[#AAB8C2] dark:border-gray-700">
                <div
                  className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1 text-sm"
                  onClick={handleInteractionClick}
                >
                  {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
                  {getReplyStatus().text}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-3 text-lightblue-400 py-4">
                  <div className="icon cursor-pointer" onClick={() => filePickerRef.current.click()}>
                    <PhotographIcon className="h-7 w-7 hoverAnimation" />

                    <input
                      type="file"
                      ref={filePickerRef}
                      hidden
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={addImageToPost}
                    />
                  </div>

                  <EmojiDropdown onEmojiSelect={addEmoji} />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    <div className={`${input.length >= MAX_TWEET_LENGTH ? 'text-red-500' : 'text-black dark:text-white'}`}>{input.length}/{MAX_TWEET_LENGTH}</div>
                    <CircularProgress current={input.length} max={MAX_TWEET_LENGTH} />
                  </div>
                  <button
                    className="bg-lightblue-500 text-white px-4 py-2 rounded-full font-bold"
                    onClick={getButtonObject().function}>
                    {getButtonObject().text}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout - profile and textarea together, controls separate */}
      <div className="w-full block sm:hidden p-3">
        {/* Profile and textarea row */}
        <div className="flex space-x-2 mb-3">
          <Link href={`/profile/${session.user.tag}`}>
            <img src={session.user.profilePic} className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer z-10" />
          </Link>

          <div className="w-full">
            <div className="border-b border-[#AAB8C2] dark:border-gray-700">
              <TextareaAutosize
                value={input}
                onChange={handleTextChange}
                className={`bg-white dark:bg-black text-black dark:text-white outline-none placeholder-gray-400 min-h-[60px] w-full resize-none font-sans text-lg`} placeholder="What's happening?" />

              {selectedFiles.length > 0 && (
                <div className="py-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedFiles}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {selectedFiles.map((file, index) => (
                          <SortableImageItem
                            key={file}
                            id={file}
                            image={file}
                            index={index}
                            onRemove={removeImage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-600 dark:text-red-400 px-3 py-2 rounded mb-2 flex items-start gap-2">
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{uploadError}</span>
          </div>
        )}

        {/* Controls section - full width on mobile */}
        {!loading && !compressingImages && (
          <div>
            {/* Interaction settings display - only show for new tweets, not edits */}
            <div className="flex items-center gap-1 py-2">
              <div
                className="text-gray-500 hover:underline cursor-pointer flex items-center gap-1 text-sm"
                onClick={handleInteractionClick}
              >
                {React.createElement(getReplyStatus().icon, { className: "h-4 w-4" })}
                {getReplyStatus().text}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-3 text-lightblue-400 py-4">
                <div className="icon cursor-pointer" onClick={() => filePickerRef.current.click()}>
                  <PhotographIcon className="h-7 w-7 hoverAnimation" />

                  <input
                    type="file"
                    ref={filePickerRef}
                    hidden
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={addImageToPost}
                  />
                </div>

                <EmojiDropdown onEmojiSelect={addEmoji} />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <div className={`${input.length >= MAX_TWEET_LENGTH ? 'text-red-500' : 'text-black dark:text-white'}`}>{input.length}/{MAX_TWEET_LENGTH}</div>
                  <CircularProgress current={input.length} max={MAX_TWEET_LENGTH} />
                  {input.length >= MAX_TWEET_LENGTH && (
                    <ExclamationCircleIcon className={`h-5 w-5 text-red-500`} />
                  )}
                </div>
                <button
                  className="bg-lightblue-500 text-white px-4 py-2 rounded-full font-bold"
                  onClick={getButtonObject().function}>
                  {getButtonObject().text}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;