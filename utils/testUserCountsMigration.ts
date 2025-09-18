import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export const testUserMigration = async () => {
  console.log(`🔍 Verifying migration results for users...`);

  try {
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'))
    );

    console.log(`Found ${usersSnapshot.docs.length} users for testing`);

    let correctCount = 0;
    let incorrectCount = 0;
    let missingCount = 0;
    const countTypes = ['followers', 'following'];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Count all interaction types
      const [followersSnapshot, followingSnapshot] = await Promise.all([
        getDocs(collection(db, 'users', userId, 'followers')),
        getDocs(collection(db, 'users', userId, 'following'))
      ]);

      const actualCounts = {
        followers: followersSnapshot.docs.length,
        following: followingSnapshot.docs.length
      };

      const storedCounts = {
        followers: userData.followersCount,
        following: userData.followingCount
      };

      let userCorrect = true;
      let errors = [];

      for (const type of countTypes) {
        if (storedCounts[type] === undefined) {
          errors.push(`Missing ${type}Count`);
          missingCount++;
          userCorrect = false;
        } else if (storedCounts[type] !== actualCounts[type]) {
          errors.push(`${type}Count mismatch: stored=${storedCounts[type]}, actual=${actualCounts[type]}`);
          incorrectCount++;
          userCorrect = false;
        }
      }

      if (userCorrect) {
        correctCount++;
      } else {
        console.log(`❌ User ${userId}: ${errors.join(', ')}`);
      }
    }

    console.log(`\n📊 VERIFICATION SUMMARY:`);
    console.log(`   ✅ Correct counts: ${correctCount}`);
    console.log(`   ❌ Incorrect counts: ${incorrectCount}`);
    console.log(`   ⚠️  Missing counts: ${missingCount}`);
    console.log(`   📈 Total verified: ${usersSnapshot.docs.length}`);

    if (correctCount === usersSnapshot.docs.length) {
      console.log(`🎉 PERFECT! All users have correct followersCount and followingCount fields!`);
    }
  } catch (error) {
    console.error('❌ Test migration failed:', error);
  }
};