import React, { useRef, useState } from 'react'
import Image from "next/image";
import TextareaAutosize from 'react-textarea-autosize';
import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";

const Input = () => {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const filePickerRef = useRef(null)
  const [showEmojis, setShowEmojis] = useState(false)

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
    <div className="flex p-2 space-x-4 border-b border-gray-500">
      <div>
        <Image src="/assets/pucci.jpeg" width={60} height={60} className="rounded-full cursor-pointer" />
      </div>

      <div className="w-full">
        <div className="border-b border-gray-500 ">
          <TextareaAutosize
            value={input}
            onChange={handleTextChange}
            className="bg-black outline-none placeholder-gray-500 min-h-[60px] w-full resize-none font-sans" placeholder="What's happening?" />


        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-3 text-lightblue-400 py-4">
            <PhotographIcon className="h-7 w-7 hoverAnimation" />
            <ChartBarIcon className="h-7 w-7 hoverAnimation" />
            <EmojiHappyIcon className="h-7 w-7 hoverAnimation" />
            <CalendarIcon className="h-7 w-7 hoverAnimation" />
          </div>

          <div className="flex items-center space-x-4">
            <div>{input.length}/400</div>
            <button className="bg-lightblue-400 px-4 py-2 rounded-full font-bold">Tweet</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Input
