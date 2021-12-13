import { doc, onSnapshot } from '@firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from "../firebase"
import { useRecoilState } from 'recoil'
import { newTweetModalState } from '../atoms/atom'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const TweetPage = ({ trendingResults, followResults, providers }: Props) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweet, setTweet] = useState()
  const [comments, setComments] = useState([])
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  // useEffect(
  //   () =>
  //     onSnapshot(doc(db, "posts", id), (snapshot) => {
  //       console.log(snapshot)
  //       setTweet(snapshot.data());
  //     }),
  //   [db]
  // );


  return (
    <div>
      L
    </div>
  )
}

export default TweetPage
