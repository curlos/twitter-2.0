import React, { useState } from 'react';
import AppLayout from '../../../components/Layout/AppLayout';
import PageHeader from '../../../components/Layout/PageHeader';
import ContentContainer from '../../../components/Layout/ContentContainer';
import { SparklesIcon, ChatAltIcon } from '@heroicons/react/outline';
import Tweet from '../../../components/Tweet/Tweet';
import DeletedTweet from '../../../components/DeletedTweet';
import SortableTweetList from '../../../components/SortableTweetList';
import { useTweetData } from '../../../hooks/useTweetData';

const TweetPage = () => {
    // State to track when tweet is being edited to prevent onSnapshot updates
    const [isEditing, setIsEditing] = useState(false);

    // Use shared hook for tweet data
    const { tweet, tweetID, author, replies, parentTweet, loading, isQuoteTweet } = useTweetData(isEditing);

    const replyingToDeletedTweet = tweet?.parentTweet && ((!parentTweet || !parentTweet.data()) && !isQuoteTweet)

    return (
        <AppLayout
            title={author ? `${author.name} on Twitter: "${tweet?.text}"` : "Tweet / Twitter 2.0"}
            setIsEditing={setIsEditing}
        >
            <ContentContainer loading={loading || !tweet || !author}>
                <PageHeader title="Tweet">
                    <SparklesIcon className="h-5 w-5" />
                </PageHeader>

                {parentTweet && parentTweet.data() && !isQuoteTweet && (
                    <Tweet id={parentTweet.id} tweet={parentTweet.data()} tweetID={parentTweet.id} topParentTweet={true} />
                )}

                {replyingToDeletedTweet && (
                    <DeletedTweet />
                )}

                <Tweet id={tweetID} tweet={tweet} tweetID={tweetID} tweetPage={true} />

                <SortableTweetList
                    tweets={replies}
                    emptyStateMessage="No replies yet"
                    emptyStateSubtitle="Be the first to reply!"
                    emptyStateIcon={ChatAltIcon}
                />

            </ContentContainer>
        </AppLayout>
    );
};

export default TweetPage;