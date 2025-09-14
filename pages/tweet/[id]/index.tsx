// Importing necessary Firestore functions to interact with the database
import { doc, DocumentData, onSnapshot } from '@firebase/firestore';
// Implementing the Next.js router for URL parameter access and routing actions
import { useRouter } from 'next/router';
// Importing React and its hooks
import React, { useEffect, useState } from 'react';
// Importing the Firestore database instance
import { db } from "../../../firebase";
// Importing more Firestore functions for query execution
import { collection, getDoc, orderBy, query, where } from 'firebase/firestore';
// Importing the Recoil state management hooks
import { useRecoilState } from 'recoil';
// Importing the global state atoms
import { newTweetModalState, colorThemeState, searchModalState, sidenavState } from '../../../atoms/atom';
// Importing Next.js Head component for manipulating the head of the page
import Head from 'next/head';

// Importing the various components used on the page
import Sidebar from '../../../components/Sidebar';
import { NewTweetModal } from '../../../components/NewTweetModal';
import { SparklesIcon } from '@heroicons/react/outline';
import Tweet from '../../../components/Tweet';
import Widgets from '../../../components/Widgets';
import MobileBottomNavBar from '../../../components/MobileBottomNavBar';
import { SearchModal } from '../../../components/SearchModal';
import Spinner from '../../../components/Spinner';
import SidenavDrawer from '../../../components/SidenavDrawer';
import DeletedTweet from '../../../components/DeletedTweet';

// TweetPage component definition
const TweetPage = () => {
    // Recoil state for the new tweet modal, the app's color theme, the search modal, and the side navigation
    const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
    const [theme, _setTheme] = useRecoilState(colorThemeState);
    const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
    const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);

    // Local state for holding the current tweet, its ID, its author, any replies, and any parent tweet and its author
    const [tweet, setTweet] = useState<DocumentData>();
    const [tweetID, setTweetID] = useState('');
    const [author, setAuthor] = useState<DocumentData>();
    const [replies, setReplies] = useState([]);
    const [parentTweet, setParentTweet] = useState<DocumentData>();
    const [_parentTweetAuthor, setParentTweetAuthor] = useState<DocumentData>();

    // Loading state for async data fetching operations
    const [loading, setLoading] = useState(true);

    // State to track when tweet is being edited to prevent onSnapshot updates
    const [isEditing, setIsEditing] = useState(false);

    // Using the Next.js router
    const router = useRouter();

    // Extracting the tweet ID from the URL parameters
    const { id } = router.query;

    // Effect hook for loading the main tweet data
    useEffect(
        () => {
            const unsubscribe = onSnapshot(doc(db, "tweets", String(id)), (snapshot) => {
                // Skip updates when editing to prevent component unmounting
                if (!isEditing) {
                    // Setting the tweet data and ID in state
                    setTweet(snapshot.data());
                    setTweetID(snapshot.id);
                }
            });
            return () => unsubscribe();
        },
        [db, id, isEditing]
    );

    // Effect hook for loading the replies to the main tweet
    useEffect(
        () => {
            const unsubscribe = onSnapshot(
                query(
                    collection(db, "tweets"),
                    where("parentTweet", "==", id),
                    orderBy("timestamp", "desc"),
                ),
                (snapshot) => {
                    // Setting the replies in state
                    setReplies(snapshot.docs);
                    setLoading(false);
                }
            );
            return () => unsubscribe();
        },
        [db, id]
    );

    // Effect hook for loading the author of the main tweet
    useEffect(() => {
        if (tweet) {
            setLoading(true);
            const docRef = doc(db, "users", tweet.userID);
            getDoc(docRef).then((snap) => {
                setAuthor(snap.data());
                setLoading(false);
                setParentTweet(null);
            });
        }

    }, [db, id, tweet]);

    // Effect hook for loading the parent tweet, if any
    useEffect(
        () => {
            if (tweet && tweet.parentTweet && tweet.parentTweet !== "") {
                const docRef = doc(db, "tweets", String(tweet.parentTweet));
                getDoc(docRef).then((snap) => {
                    // Setting the parent tweet in state
                    setParentTweet(snap);
                });
            }
        }, [db, id, tweet]);

    // Effect hook for loading the author of the parent tweet
    useEffect(() => {
        if (parentTweet && parentTweet.data()) {
            const docRef = doc(db, "users", String(parentTweet.data().userID));
            getDoc(docRef).then((snap) => {
                // Setting the parent tweet's author in state
                setParentTweetAuthor(snap.data());
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [db, id, parentTweet]);


    // Rendering the TweetPage component
    return (
        !loading && tweet && author ? (
            <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
                <Head>
                    <title>
                        {author?.name} on Twitter: "{tweet?.text}"
                    </title>
                    <link rel="icon" href="/assets/twitter-logo.svg" />
                </Head>

                <main className={`${theme} bg-white text-black dark:bg-black dark:text-white px-0 lg:px-36 xl:px-48 2xl:px-12 min-h-screen flex  `}>
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

                            {parentTweet && parentTweet.data() && <Tweet id={String(id)} tweet={parentTweet.data()} tweetID={parentTweet.id} topParentTweet={true} />}

                            {parentTweet && !parentTweet.data() && (
                                <DeletedTweet />
                            )}

                            <Tweet id={String(id)} tweet={tweet} tweetID={tweetID} tweetPage={true} />

                            {replies.map((tweetObj) => <Tweet key={tweetObj.id} id={tweetObj.id} tweet={{
                                ...tweetObj.data(),
                                tweetId: tweetObj.id
                            }} tweetID={tweetObj.id} />)}
                            <div className="h-[60px]" />


                        </div>
                    )}

                    <Widgets />

                    {isOpen && <NewTweetModal setIsEditing={setIsEditing} />}
                    {isSearchModalOpen && <SearchModal />}
                    {isSidenavOpen && <SidenavDrawer />}

                    <MobileBottomNavBar />
                </main>

            </div>
        ) : null
    );
};

export default TweetPage;