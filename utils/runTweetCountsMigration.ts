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

        try {
          // Only fetch the counts we need
          const fetchPromises = [];
          fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'likes')));
          fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'retweets')));
          fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'replies')));
          fetchPromises.push(getDocs(collection(db, 'tweets', tweetId, 'bookmarks')));

          const results = await Promise.all(fetchPromises);

          let resultIndex = 0;
          const updateData: any = {};
          let logParts = [];

          const likesCount = results[resultIndex++].docs.length;
          updateData.likesCount = likesCount;
          logParts.push(`likes=${likesCount}`);

          const retweetsCount = results[resultIndex++].docs.length;
          updateData.retweetsCount = retweetsCount;
          logParts.push(`retweets=${retweetsCount}`);

          const repliesCount = results[resultIndex++].docs.length;
          updateData.repliesCount = repliesCount;
          logParts.push(`replies=${repliesCount}`);

          const bookmarksCount = results[resultIndex++].docs.length;
          updateData.bookmarksCount = bookmarksCount;
          logParts.push(`bookmarks=${bookmarksCount}`);

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