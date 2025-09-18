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

export const migrateUserCounts = async () => {
  console.log('🚀 Starting user count migration...');
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let lastDoc = null;
  const batchSize = 50; // Process 50 users at a time for safety

  try {
    while (true) {
      console.log(`\n📦 Processing batch starting from document ${totalProcessed}...`);

      // Get users in batches
      let usersQuery = query(
        collection(db, 'users'),
        limit(batchSize)
      );

      if (lastDoc) {
        usersQuery = query(
          collection(db, 'users'),
          startAfter(lastDoc),
          limit(batchSize)
        );
      }

      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        console.log('✅ No more users to process');
        break;
      }

      const batch = writeBatch(db);
      let batchUpdates = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        try {
          // Fetch followers and following counts
          const fetchPromises = [];
          fetchPromises.push(getDocs(collection(db, 'users', userId, 'followers')));
          fetchPromises.push(getDocs(collection(db, 'users', userId, 'following')));

          const results = await Promise.all(fetchPromises);

          let resultIndex = 0;
          const updateData: any = {};
          let logParts = [];

          const followersCount = results[resultIndex++].docs.length;
          updateData.followersCount = followersCount;
          logParts.push(`followers=${followersCount}`);

          const followingCount = results[resultIndex++].docs.length;
          updateData.followingCount = followingCount;
          logParts.push(`following=${followingCount}`);

          // Update user with the counts
          const userRef = doc(db, 'users', userId);
          batch.update(userRef, updateData);

          console.log(`✏️  User ${userId}: ${logParts.join(', ')}`);
          batchUpdates++;
          totalUpdated++;

        } catch (error) {
          console.error(`❌ Error processing user ${userId}:`, error);
        }
      }

      // Commit batch if there are updates
      if (batchUpdates > 0) {
        await batch.commit();
        console.log(`✅ Committed batch with ${batchUpdates} updates`);
      } else {
        console.log(`⏭️  No updates needed for this batch`);
      }

      totalProcessed += usersSnapshot.docs.length;
      lastDoc = usersSnapshot.docs[usersSnapshot.docs.length - 1];

      console.log(`📊 Progress: ${totalProcessed} processed, ${totalUpdated} updated, ${totalSkipped} skipped`);

      // Small delay to be nice to Firebase
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Migration complete!');
    console.log(`📈 Final stats:`);
    console.log(`   • Total users processed: ${totalProcessed}`);
    console.log(`   • Users updated: ${totalUpdated}`);
    console.log(`   • Users skipped (already had counts): ${totalSkipped}`);

    return { totalProcessed, totalUpdated, totalSkipped };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log(`📊 Progress before failure: ${totalProcessed} processed, ${totalUpdated} updated`);
    throw error;
  }
};