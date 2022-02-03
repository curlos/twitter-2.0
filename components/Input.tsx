import React, { useRef, useState } from 'react'
import Image from "next/image";
import { db, storage } from '../firebase'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@firebase/firestore'
import { getDownloadURL, ref, uploadString } from '@firebase/storage'
import TextareaAutosize from 'react-textarea-autosize';
import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
  ExclamationCircleIcon
} from "@heroicons/react/outline";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, tweetIdState } from '../atoms/atom';
import Link from 'next/link';

interface Props {
  replyModal?: boolean
  tweetId?: string,
  showEmojiState?: boolean,
  setShowEmojiState?: React.Dispatch<React.SetStateAction<boolean>>
}

const Input = ({ replyModal, tweetId, showEmojiState, setShowEmojiState }: Props) => {
  const { data: session } = useSession()

  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const filePickerRef = useRef(null)
  const [showEmojis, setShowEmojis] = useState(showEmojiState || false)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)

  const sendTweet = async () => {
    if (loading) return
    setLoading(true)

    const docRef = await addDoc(collection(db, 'tweets'), {
      userID: session.user.uid,
      text: input,
      parentTweet: replyModal ? tweetId : '',
      timestamp: serverTimestamp()
    })

    if (replyModal) {
      await setDoc(doc(db, "tweets", tweetId, "replies", docRef.id), {
        name: session.user.name,
      })
    }

    const imageRef = ref(storage, `tweets/${docRef.id}/image`)

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef)
        await updateDoc(doc(db, "tweets", docRef.id), {
          image: downloadURL
        })
      })
    }

    setLoading(false)
    setInput('')
    setSelectedFile(null)
    setShowEmojis(false)
    setIsOpen(false)
  }

  const addImageToPost = (e) => {
    const reader = new FileReader()
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0])
    }

    reader.onload = (readerEvent) => [
      setSelectedFile(readerEvent.target.result)
    ]
  }

  const addEmoji = (e) => {
    let sym = e.unified.split('-')
    let codesArray = []
    sym.forEach((el) => codesArray.push('0x' + el))
    let emoji = String.fromCodePoint(...codesArray)
    setInput(input + emoji)
  }

  const handleTextChange = (e) => {
    if (e.target.value.length <= 400) {
      setInput(e.target.value)
    } else {
      setInput(e.target.value.slice(0, 400))
    }
  }

  return (
    <div className={`flex p-3 space-x-2 border-b z-10 border-[#AAB8C2]  dark:border-gray-700 ${loading && 'opacity-60'} ${(replyModal && 'pt-0 border-none') || ''}`}>
      <Link href={`/profile/${session.user.tag}`}>
        <img src={session.user.profilePic} className="rounded-full h-[55px] w-[55px] object-cover cursor-pointer z-10" />
      </Link>

      <div className="w-full">
        <div className="border-b border-[#AAB8C2]  dark:border-gray-700 ">
          <TextareaAutosize
            value={input}
            onChange={handleTextChange}
            className={`bg-white dark:bg-black text-black dark:text-white outline-none placeholder-gray-400 min-h-[60px] w-full resize-none font-sans text-lg`} placeholder="What's happening?" />

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
            <div className="flex justify-between items-center">
              <div className="flex space-x-3 text-lightblue-400 py-4">
                <div className="icon" onClick={() => filePickerRef.current.click()}>
                  <PhotographIcon className="h-7 w-7 hoverAnimation" />

                  <input
                    type="file"
                    ref={filePickerRef}
                    hidden
                    onChange={addImageToPost}
                  />
                </div>

                <div className="icon" onClick={() => {
                  setShowEmojis(!showEmojis)
                  if (setShowEmojiState) {
                    setShowEmojiState(!showEmojis)
                  }
                }}>
                  <EmojiHappyIcon className="h-7 w-7 hoverAnimation" />
                </div>

                {showEmojis && (
                  <Picker
                    onSelect={addEmoji}
                    style={{
                      position: "fixed",
                      marginTop: "40px",
                      marginLeft: -40,
                      maxWidth: "320px",
                      borderRadius: "20px"
                    }}
                    theme="dark"
                  />
                )}
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <div className={`${input.length >= 400 ? 'text-red-500' : 'text-black dark:text-white'}`}>{input.length}/400</div>
                <button
                  className="bg-lightblue-500 text-white px-4 py-2 rounded-full font-bold"
                  onClick={sendTweet}>
                  {!replyModal ? 'Tweet' : 'Reply'}
                </button>
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-4">
              <div className={`${input.length >= 400 ? 'text-red-500' : 'text-black dark:text-white'} flex gap-2`}>
                {input.length >= 400 && (
                  <ExclamationCircleIcon className={`h-5 w-5 text-red-500`} />
                )}
                {input.length}/400</div>
              <button
                className="bg-lightblue-500 text-white px-4 py-2 rounded-full font-bold w-full"
                onClick={sendTweet}>
                {!replyModal ? 'Tweet' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Input