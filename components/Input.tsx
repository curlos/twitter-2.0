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
} from "@heroicons/react/outline";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { newTweetModalState, tweetIdState } from '../atoms/atom';

interface Props {
  replyModal?: boolean
  tweetId?: string
}

const Input = ({ replyModal, tweetId }: Props) => {
  const { data: session } = useSession()

  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const filePickerRef = useRef(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)

  console.log(session)

  const sendTweet = async () => {
    if (loading) return
    setLoading(true)

    console.log(session)

    const docRef = await addDoc(collection(db, 'tweets'), {
      userID: session.user.uid,
      username: session.user.name,
      profilePic: session.user.profilePic,
      tag: session.user.tag,
      text: input,
      parentTweet: replyModal ? tweetId : '',
      timestamp: serverTimestamp()
    })

    if (replyModal) {
      await setDoc(doc(db, "tweets", tweetId, "replies", docRef.id), {
        username: session.user.name,
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
    }
  }

  return (
    <div className={`flex p-3 space-x-2 border-b border-gray-500 ${loading && 'opacity-60'} ${(replyModal && 'pt-0 border-none') || ''}`}>
      <div>
        <img src={session.user.profilePic} className="rounded-full h-[55px] w-[55px] max-w-none object-cover" />
      </div>

      <div className="w-full">
        <div className="border-b border-gray-500 ">
          <TextareaAutosize
            value={input}
            onChange={handleTextChange}
            className={`bg-black outline-none placeholder-gray-400 min-h-[60px] w-full resize-none font-sans text-lg`} placeholder="What's happening?" />

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

              <div className="icon">
                <ChartBarIcon className="h-7 w-7 hoverAnimation" />
              </div>

              <div className="icon" onClick={() => setShowEmojis(!showEmojis)}>
                <EmojiHappyIcon className="h-7 w-7 hoverAnimation" />
              </div>

              <div className="icon">
                <CalendarIcon className="h-7 w-7 hoverAnimation" />
              </div>

              {showEmojis && (
                <Picker
                  onSelect={addEmoji}
                  style={{
                    position: "absolute",
                    marginTop: "40px",
                    marginLeft: -40,
                    maxWidth: "320px",
                    borderRadius: "20px"
                  }}
                  theme="dark"
                />
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div>{input.length}/400</div>
              <button
                className="bg-lightblue-500 px-4 py-2 rounded-full font-bold"
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