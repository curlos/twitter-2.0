import { doc, DocumentData, onSnapshot } from '@firebase/firestore'
import { getProviders, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from "../../firebase"
import { useRecoilState } from 'recoil'
import { newTweetModalState, colorThemeState, searchModalState } from '../../atoms/atom'
import Head from 'next/head'
import Sidebar from '../../components/Sidebar'
import { NewTweetModal } from '../../components/NewTweetModal'
import { SparklesIcon } from '@heroicons/react/outline'
import Tweet from '../../components/Tweet'
import { collection, getDoc, orderBy, query, where } from 'firebase/firestore'
import Widgets from '../../components/Widgets'
import SettingsModal from '../../components/SettingsModal'
import Footer from '../../components/Footer'
import { SearchModal } from '../../components/SearchModal'
import Spinner from '../../components/Spinner'

interface Props {
  trendingResults: any,
  followResults: any,
  providers: any
}

const TweetPage = ({ trendingResults, followResults, providers }: Props) => {


  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(newTweetModalState)
  const [theme, setTheme] = useRecoilState(colorThemeState)
  const [isSearchModalOpen, setIsSearchModalOpen] = useRecoilState(searchModalState)
  const [tweet, setTweet] = useState<DocumentData>()
  const [tweetID, setTweetID] = useState('')
  const [author, setAuthor] = useState<DocumentData>()
  const [replies, setReplies] = useState([])
  const [parentTweet, setParentTweet] = useState<DocumentData>()
  const [parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  useEffect(
    () =>
      onSnapshot(doc(db, "tweets", String(id)), (snapshot) => {
        console.log(snapshot.data())
        setTweet(snapshot.data())
        setTweetID(snapshot.id)
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
    if (tweet) {
      setLoading(true)
      const docRef = doc(db, "users", tweet.userID)
      getDoc(docRef).then((snap) => {
        console.log(snap.data())
        setAuthor(snap.data())
        setLoading(false)
        setParentTweet(null)
      })
    }

  }, [db, id, tweet])

  useEffect(
    () => {
      if (tweet && tweet.parentTweet && tweet.parentTweet !== "") {
        const docRef = doc(db, "tweets", String(tweet.parentTweet))
        getDoc(docRef).then((snap) => {
          setParentTweet(snap)
        })
      }
    }, [db, id, tweet])

  useEffect(() => {
    if (parentTweet) {
      const docRef = doc(db, "users", String(parentTweet.data().userID))
      getDoc(docRef).then((snap) => {
        setParentTweetAuthor(snap.data())
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [db, id, parentTweet])

  // console.log(parentTweet.data())

  console.log(tweet)
  console.log(parentTweet)


  return (
    !loading && tweet && author ? (
      <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
        <Head>
          <title>
            {author?.name} on Twitter: "{tweet?.text}"
          </title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={`${theme} bg-white text-black dark:bg-black dark:text-white px-0 lg:px-12 min-h-screen flex  `}>
          <Sidebar />

          {loading ? (
            <div className="min-h-screen flex justfiy-center items-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-gray-400  dark:border-gray-700">
              <div className="flex justify-between items-center border-b border-[#AAB8C2]  dark:border-gray-700 p-3">
                <h2 className="font-bold">Tweet</h2>
                <SparklesIcon className="h-5 w-5" />
              </div>

              {parentTweet && <Tweet id={String(id)} tweet={parentTweet.data()} tweetID={parentTweet.id} topParentTweet={true} />}

              <Tweet id={String(id)} tweet={tweet} tweetID={tweetID} tweetPage={true} />

              {replies.map((tweetObj) => <Tweet key={tweetObj.id} id={tweetObj.id} tweet={tweetObj.data()} tweetID={tweetObj.id} />)}
              <div className="h-[60px]" />


            </div>
          )}


          <Widgets />

          {isOpen && <NewTweetModal />}
          {isSearchModalOpen && <SearchModal />}


          <Footer />
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