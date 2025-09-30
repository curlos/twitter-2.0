import React, { useEffect, useRef, useState } from 'react';
import { db, storage } from '../firebase';

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
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const filePickerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [_isOpen, setIsOpen] = useRecoilState(newTweetModalState);
  const setIsQuoteTweet = useSetRecoilState(isQuoteTweetState);
  const setEditInteractionSettingsModalOpen = useSetRecoilState(editInteractionSettingsModalState);
  const setEditInteractionSettingsTweet = useSetRecoilState(editInteractionSettingsTweetState);
  const setTweetSentAlert = useSetRecoilState(tweetSentAlertState);
  const isEditingTweet = (tweetToEdit && Object.keys(tweetToEdit).length >= 1 && (tweetToEdit?.text?.length > 0 || tweetToEdit?.image?.length > 0 || tweetToEdit?.images?.length > 0));

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
      setSelectedFile('')
      setSelectedFiles([])
      return
    }

    if (tweetToEdit?.text) {
      setInput(tweetToEdit.text);
    }

    if (tweetToEdit?.images && tweetToEdit.images.length > 0) {
      setSelectedFiles(tweetToEdit.images);
    } else if (tweetToEdit?.image) {
      setSelectedFile(tweetToEdit?.image);
      setSelectedFiles([]);
    }
  }, [tweetToEdit]);

  const resetCoreStateValues = () => {
    setLoading(false);
    setInput('');
    setSelectedFile(null);
    setSelectedFiles([]);
    setIsOpen(false);
    setIsQuoteTweet(false);

    if (setTweetToEdit) {
      setTweetToEdit(null)
    }
  }

  const sendTweet = async () => {
    // If a tweet is already being sent or there's no text AND no images then DO NOT send tweet
    if (loading || (!input && !selectedFile && selectedFiles.length === 0)) return;
    setLoading(true);

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

    if (selectedFiles.length > 0) {
      const imageUrls = await uploadImagesAndGetURLs(docRef.id);
      await updateDoc(doc(db, "tweets", docRef.id), {
        images: imageUrls
      });
    } else if (selectedFile) {
      const downloadURL = await uploadImageAndGetURL(docRef.id);
      await updateDoc(doc(db, "tweets", docRef.id), {
        image: downloadURL
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
  };

  const editTweet = async () => {
    const currentTweet = tweetToEdit;

    // If a tweet is already being sent or there's no text AND no images then DO NOT send tweet
    if (loading || (!input && !selectedFile && selectedFiles.length === 0)) return;

    setLoading(true);

    // Enable editing mode to pause onSnapshot updates
    if (setIsEditing) {
      setIsEditing(true);
    }

    // If the image(s) have already been uploaded (meaning they have not been changed since the past version and have URLs as strings)
    const imageAlreadyUploaded = selectedFile && selectedFile.startsWith('http');
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
    } else if (imageAlreadyUploaded) {
      updatedObject.image = selectedFile;
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
      } else if (selectedFile && !imageAlreadyUploaded) {
        // If this is a new single image that the user just uploaded
        const downloadURL = await uploadImageAndGetURL(currentTweet.tweetId);
        if (downloadURL) {
          updatedObject.image = downloadURL;
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
      // Make sure to disable editing mode even on error
      if (setIsEditing) {
        setIsEditing(false);
      }
      console.error(error);
    }
  };

  const uploadImageAndGetURL = async (docRefId: string) => {
    const imageRef = ref(storage, `tweets/${docRefId}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    }
    return null;
  };

  const uploadImagesAndGetURLs = async (docRefId: string) => {
    const imageUrls = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // If the file is already a URL (starts with http), just add it to the array
      if (file.startsWith('http')) {
        imageUrls.push(file);
      } else {
        // Only upload new images (base64 data)
        const imageRef = ref(storage, `tweets/${docRefId}/image_${i}`);
        await uploadString(imageRef, file, "data_url");
        const downloadURL = await getDownloadURL(imageRef);
        imageUrls.push(downloadURL);
      }
    }

    return imageUrls;
  };

  const addImageToPost = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = selectedFiles.length + files.length;

    if (totalFiles > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images per tweet.`);
      return;
    }

    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => resolve(readerEvent.target.result);
        reader.readAsDataURL(file as Blob);
      });
    });

    Promise.all(filePromises).then(results => {
      setSelectedFiles(prev => [...prev, ...results]);
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
      {loading && (
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

            {selectedFile && (
              <div className="py-3">
                <div className="relative">
                  <div className="absolute w-8 h-7 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setSelectedFile(null)}>
                    <XIcon className="text-white h-7" />
                  </div>
                </div>

                <img src={selectedFile} alt="" className="rounded-2xl max-h-80 object-contain" />
              </div>
            )}
          </div>

          {!loading && (
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
                      accept="image/*"
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

              {selectedFile && (
                <div className="py-3">
                  <div className="relative">
                    <div className="absolute w-8 h-7 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setSelectedFile(null)}>
                      <XIcon className="text-white h-7" />
                    </div>
                  </div>

                  <img src={selectedFile} alt="" className="rounded-2xl max-h-80 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls section - full width on mobile */}
        {!loading && (
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
                    accept="image/*"
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