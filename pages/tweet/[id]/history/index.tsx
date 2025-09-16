import React from 'react';
import AppLayout from '../../../../components/Layout/AppLayout';
import PageHeader from '../../../../components/Layout/PageHeader';
import ContentContainer from '../../../../components/Layout/ContentContainer';
import { SparklesIcon } from '@heroicons/react/outline';
import Tweet from '../../../../components/Tweet';
import DeletedTweet from '../../../../components/DeletedTweet';
import { ITweet } from '../../../../utils/types';
import { useTweetData } from '../../../../hooks/useTweetData';

const TweetVersionHistory = () => {
    // Use shared hook for tweet data (no isEditing needed for history page)
    const { tweet, tweetID, author, replies, parentTweet, loading } = useTweetData(false, false);

    return (
        <AppLayout title={author ? `${author.name} on Twitter: "${tweet?.text}"` : "Tweet History / Twitter 2.0"}>
            <ContentContainer loading={loading || !tweet || !author}>
                <PageHeader title="Edit History">
                    <SparklesIcon className="h-5 w-5" />
                </PageHeader>

                {parentTweet && parentTweet.data() && (
                    <Tweet id={parentTweet.id} tweet={parentTweet.data()} tweetID={parentTweet.id} topParentTweet={true} />
                )}

                {parentTweet && !parentTweet.data() && (
                    <DeletedTweet />
                )}

                <div className="font-bold text-xl p-3 pt-5">Latest Tweet</div>
                <Tweet id={tweetID} tweet={tweet} tweetID={tweetID} />

                <div className="font-bold text-xl p-3 pt-5">Version History</div>

                {/* List of Past Tweets */}
                {tweet?.versionHistory && tweet?.versionHistory.toReversed().map((pastTweet: ITweet, index: number) => (
                    <Tweet
                        key={`${pastTweet.tweetId}-${pastTweet.timestamp?.seconds || index}`}
                        id={String(pastTweet.tweetId)}
                        tweet={pastTweet}
                        tweetID={pastTweet.tweetId}
                        pastTweet={true}
                    />
                ))}

            </ContentContainer>
        </AppLayout>
    );
};

export default TweetVersionHistory;