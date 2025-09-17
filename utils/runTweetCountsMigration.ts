import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  limit,
  startAfter
} from 'firebase/firestore';

export const migrateTweetCounts = async () => {
  console.log('🚀 Starting tweet count migration...');
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let lastDoc = null;
  const batchSize = 50; // Process 50 tweets at a time for safety

  try {
    while (true) {
      console.log(`\n📦 Processing batch starting from document ${totalProcessed}...`);

      // Get tweets in batches
      let tweetsQuery = query(
        collection(db, 'tweets'),
        limit(batchSize)
      );

      if (lastDoc) {
        tweetsQuery = query(
          collection(db, 'tweets'),
          startAfter(lastDoc),
          limit(batchSize)
        );
      }

      const tweetsSnapshot = await getDocs(tweetsQuery);

      if (tweetsSnapshot.empty) {
        console.log('✅ No more tweets to process');
        break;
      }

      const batch = writeBatch(db);
      let batchUpdates = 0;

      for (const tweetDoc of tweetsSnapshot.docs) {
        const tweetId = tweetDoc.id;
        const tweetData = tweetDoc.data();

        // Check which counts are missing
        const needsLikes = tweetData.likesCount === undefined;
        const needsRetweets = tweetData.retweetsCount === undefined;
        const needsReplies = tweetData.repliesCount === undefined;
        const needsBookmarks = tweetData.bookmarksCount === undefined;

        if (!needsLikes && !needsRetweets && !needsReplies && !needsBookmarks) {
          console.log(`⏭️  Tweet ${tweetId} already has all counts, skipping`);
          totalSkipped++;
          continue;
        }

        try {
          // Only fetch the counts we need
          const fetchPromises = [];
          if (needsLikes) fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'likes')));
          if (needsRetweets) fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'retweets')));
          if (needsReplies) fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'replies')));
          if (needsBookmarks) fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'bookmarks')));

          const results = await Promise.all(fetchPromises);

          let resultIndex = 0;
          const updateData: any = {};
          let logParts = [];

          if (needsLikes) {
            const likesCount = results[resultIndex++].docs.length;
            updateData.likesCount = likesCount;
            logParts.push(`likes=${likesCount}`);
          }
          if (needsRetweets) {
            const retweetsCount = results[resultIndex++].docs.length;
            updateData.retweetsCount = retweetsCount;
            logParts.push(`retweets=${retweetsCount}`);
          }
          if (needsReplies) {
            const repliesCount = results[resultIndex++].docs.length;
            updateData.repliesCount = repliesCount;
            logParts.push(`replies=${repliesCount}`);
          }
          if (needsBookmarks) {
            const bookmarksCount = results[resultIndex++].docs.length;
            updateData.bookmarksCount = bookmarksCount;
            logParts.push(`bookmarks=${bookmarksCount}`);
          }

          // Update tweet with only the missing counts
          const tweetRef = doc(db, 'tweets', tweetId);
          batch.update(tweetRef, updateData);

          console.log(`✏️  Tweet ${tweetId}: ${logParts.join(', ')}`);
          batchUpdates++;
          totalUpdated++;

        } catch (error) {
          console.error(`❌ Error processing tweet ${tweetId}:`, error);
        }
      }

      // Commit batch if there are updates
      if (batchUpdates > 0) {
        await batch.commit();
        console.log(`✅ Committed batch with ${batchUpdates} updates`);
      } else {
        console.log(`⏭️  No updates needed for this batch`);
      }

      totalProcessed += tweetsSnapshot.docs.length;
      lastDoc = tweetsSnapshot.docs[tweetsSnapshot.docs.length - 1];

      console.log(`📊 Progress: ${totalProcessed} processed, ${totalUpdated} updated, ${totalSkipped} skipped`);

      // Small delay to be nice to Firebase
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Migration complete!');
    console.log(`📈 Final stats:`);
    console.log(`   • Total tweets processed: ${totalProcessed}`);
    console.log(`   • Tweets updated: ${totalUpdated}`);
    console.log(`   • Tweets skipped (already had counts): ${totalSkipped}`);

    return { totalProcessed, totalUpdated, totalSkipped };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log(`📊 Progress before failure: ${totalProcessed} processed, ${totalUpdated} updated`);
    throw error;
  }
};