import { doc, DocumentData, onSnapshot } from '@firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from "../../firebase"
import { useRecoilState } from 'recoil'
import { newTweetModalState } from '../../atoms/atom'
import Head from 'next/head'
import Sidebar from '../../components/Sidebar'
import { NewTweetModal } from '../../components/NewTweetModal'
import { SparklesIcon } from '@heroicons/react/outline'
import Tweet from '../../components/Tweet'
import { collection, getDoc, orderBy, query, where } from 'firebase/firestore'
import Widgets from '../../components/Widgets'
import SettingsModal from '../../components/SettingsModal'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const TweetPage = ({ trendingResults, followResults, providers }: Props) => {


  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [tweet, setTweet] = useState<DocumentData>()
  const [author, setAuthor] = useState<DocumentData>()
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  useEffect(
    () =>
      onSnapshot(doc(db, "tweets", String(id)), (snapshot) => {
        console.log(snapshot)
        setTweet(snapshot.data());
      }),
    [db, id]
  )

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "tweets"),
          where("parentTweet", "==", id),
          orderBy("timestamp", "desc"),
        ),
        (snapshot) => {
          console.log(snapshot)
          setReplies(snapshot.docs)
          setLoading(false)
        }
      ),
    [db, id]
  )

  useEffect(() => {
    if (!loading) {
      setLoading(true)
      const docRef = doc(db, "users", tweet.userID)
      getDoc(docRef).then((snap) => {
        console.log(snap.data())
        setAuthor(snap.data())
        setLoading(false)
      })
    }

  }, [db, id])

  console.log(author)


  return (
    !loading ? (
      <div className="px-12 min-h-screen min-w-screen">
        <Head>
          <title>
            {author?.name} on Twitter: "{tweet?.text}"
          </title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
          <Sidebar />

          {loading ? <div>Loading...</div> : (
            <div className="flex-grow ml-[280px] text-lg border-r border-gray-500">
              <div className="flex justify-between border-b border-gray-500 p-3">
                <h2 className="font-bold">Tweet</h2>
                <SparklesIcon className="h-5 w-5" />
              </div>

              <Tweet id={String(id)} tweet={tweet} tweetPage={true} />

              {replies.map((tweetObj) => <Tweet id={tweetObj.id} tweet={tweetObj.data()} parentTweet={tweet} />)}


            </div>
          )}


          <Widgets />
          {isOpen && <NewTweetModal />}
        </main>

      </div>
    ) : null
  )
}

export default TweetPage

export async function getServerSideProps(context) {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then(
    (res) => res.json()
  );
  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then(
    (res) => res.json()
  );
  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session,
    },
  };
}