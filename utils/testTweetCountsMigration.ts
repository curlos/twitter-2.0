import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export const testMigration = async () => {
  console.log(`🔍 Verifying migration results tweets...`);

  try {
    const tweetsSnapshot = await getDocs(
      query(collection(db, 'tweets'))
    );

    console.log(`Found ${tweetsSnapshot.docs.length} tweets for testing`);

    let correctCount = 0;
    let incorrectCount = 0;
    let missingCount = 0;
    const countTypes = ['likes', 'retweets', 'replies', 'bookmarks'];

    for (const tweetDoc of tweetsSnapshot.docs) {
      const tweetId = tweetDoc.id;
      const tweetData = tweetDoc.data();

      // Count all interaction types
      const [likesSnapshot, retweetsSnapshot, repliesSnapshot, bookmarksSnapshot] = await Promise.all([
        getDocs(collection(db, 'tweets', tweetId, 'likes')),
        getDocs(collection(db, 'tweets', tweetId, 'retweets')),
        getDocs(collection(db, 'tweets', tweetId, 'replies')),
        getDocs(collection(db, 'tweets', tweetId, 'bookmarks'))
      ]);

      const actualCounts = {
        likes: likesSnapshot.docs.length,
        retweets: retweetsSnapshot.docs.length,
        replies: repliesSnapshot.docs.length,
        bookmarks: bookmarksSnapshot.docs.length
      };

      const storedCounts = {
        likes: tweetData.likesCount,
        retweets: tweetData.retweetsCount,
        replies: tweetData.repliesCount,
        bookmarks: tweetData.bookmarksCount
      };

      let tweetCorrect = true;
      let errors = [];

      for (const type of countTypes) {
        if (storedCounts[type] === undefined) {
          errors.push(`Missing ${type}Count`);
          missingCount++;
          tweetCorrect = false;
        } else if (storedCounts[type] !== actualCounts[type]) {
          errors.push(`${type}Count mismatch: stored=${storedCounts[type]}, actual=${actualCounts[type]}`);
          incorrectCount++;
          tweetCorrect = false;
        }
      }

      if (tweetCorrect) {
        correctCount++;
      } else {
        console.log(`❌ Tweet ${tweetId}: ${errors.join(', ')}`);
      }
    }

    console.log(`\n📊 VERIFICATION SUMMARY:`);
    console.log(`   ✅ Correct counts: ${correctCount}`);
    console.log(`   ❌ Incorrect counts: ${incorrectCount}`);
    console.log(`   ⚠️  Missing counts: ${missingCount}`);
    console.log(`   📈 Total verified: ${tweetsSnapshot.docs.length}`);

    if (correctCount === tweetsSnapshot.docs.length) {
      console.log(`🎉 PERFECT! All tweets have correct likesCount fields!`);
    }
  } catch (error) {
    console.error('❌ Test migration failed:', error);
  }
};