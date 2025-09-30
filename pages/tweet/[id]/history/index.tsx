import React from 'react';
import AppLayout from '../../../../components/Layout/AppLayout';
import PageHeader from '../../../../components/Layout/PageHeader';
import ContentContainer from '../../../../components/Layout/ContentContainer';
import { SparklesIcon, ClockIcon } from '@heroicons/react/outline';
import Tweet from '../../../../components/Tweet/Tweet';
import DeletedTweet from '../../../../components/DeletedTweet';
import { ITweet } from '../../../../utils/types';
import { useTweetData } from '../../../../hooks/useTweetData';

const TweetVersionHistory = () => {
    // Use shared hook for tweet data (no isEditing needed for history page)
    const { tweet, tweetID, author, replies, parentTweet, loading, isQuoteTweet } = useTweetData(false, false);

    return (
        <AppLayout title={author ? `${author.name} on Twitter: "${tweet?.text}"` : "Tweet History / Twitter 2.0"}>
            <ContentContainer loading={loading || !tweet || !author}>
                <PageHeader title="Edit History">
                    <SparklesIcon className="h-5 w-5" />
                </PageHeader>

                <div className="font-bold text-xl p-3">Latest Tweet</div>

                {parentTweet && parentTweet.data() && !isQuoteTweet && (
                    <Tweet id={parentTweet.id} tweet={parentTweet.data()} tweetID={parentTweet.id} topParentTweet={true} />
                )}

                {parentTweet && !parentTweet.data() && !isQuoteTweet && (
                    <DeletedTweet />
                )}

                <Tweet id={tweetID} tweet={tweet} tweetID={tweetID} showFullView={true} />

                <div className="font-bold text-xl p-3 pt-5">Past Version History</div>

                {/* List of Past Tweets or Empty State */}
                {tweet?.versionHistory && tweet?.versionHistory.length > 0 ? (
                    tweet.versionHistory.toReversed().map((pastTweet: ITweet, index: number) => (
                        <Tweet
                            key={`${pastTweet.tweetId}-${pastTweet.timestamp?.seconds || index}`}
                            id={String(pastTweet.tweetId)}
                            tweet={pastTweet}
                            tweetID={pastTweet.tweetId}
                            pastTweet={true}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-900 dark:text-gray-500">
                        <ClockIcon className="h-12 w-12 mb-4" />
                        <p className="text-xl font-semibold">No edit history</p>
                        <p className="text-gray-700 dark:text-gray-400 mt-2">This tweet hasn't been edited yet</p>
                    </div>
                )}

            </ContentContainer>
        </AppLayout>
    );
};

export default TweetVersionHistory;