import { doc, DocumentData, getDoc } from 'firebase/firestore'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'

interface Props {
  tweet: any
}

const ParentTweet = ({ tweet }: Props) => {

  const [author, setAuthor] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log(tweet)
    const docRef = doc(db, "users", tweet.userID)
    getDoc(docRef).then((snap) => {
      console.log(snap.data())
      setAuthor(snap.data())
      setLoading(false)
    })

  }, [db])

  return (
    !loading ? (
      <div className="flex p-3 space-x-2 pb-0 h-full">
        <div className="h-full">
          <img src={author.profilePic} alt="" className="rounded-full h-[55px] w-[55px] object-cover" />
          <span className="border-r-2 border-gray-700 h-1/2 absolute ml-[27px]" />
        </div>

        <div>
          <div className="flex text-gray-400">
            <div className="text-white mr-[2px]">{author.name}</div>
            <div>@{author.tag}</div>
            <div className="text-gray-500 mx-1 font-bold">·</div>
            {tweet.timestamp && tweet.timestamp.seconds && (
              <div className="text-gray-500">{moment(tweet.timestamp.seconds * 1000).fromNow()}</div>
            )}
          </div>

          <div>
            <div>{tweet.text}</div>

            {tweet.image && (
              <div className="pt-3">
                <img src={tweet.image} alt="" className="rounded-2xl max-h-80 object-contain" />
              </div>
            )}
          </div>
          <div className="my-3 text-gray-400">
            Replying to <span className="text-lightblue-400">@{author.tag}</span>
          </div>
        </div>
      </div>
    ) : null
  )
}

export default ParentTweet

function tweet(tweet: any) {
  throw new Error('Function not implemented.')
}
