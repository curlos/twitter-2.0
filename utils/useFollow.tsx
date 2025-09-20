import { useCallback } from 'react';
import { doc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';

/**
 * @description - Handles what happens when a user wants to follow or unfollow someone.
 * @returns {Object || undefined}
 */
export const useFollow = ({ session, followed, db, userID }) => {
    return useCallback(async () => {
        if (!session) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/auth'
                }
            };
        }

        try {
            const batch = writeBatch(db);

            if (followed) {
                // Unfollow: remove documents and decrement counts
                batch.delete(doc(db, "users", userID, "followers", String(session.user.uid)));
                batch.delete(doc(db, "users", String(session.user.uid), "following", userID));
                batch.update(doc(db, "users", userID), { followersCount: increment(-1) });
                batch.update(doc(db, "users", String(session.user.uid)), { followingCount: increment(-1) });
            } else {
                // Follow: add documents and increment counts
                batch.set(doc(db, "users", userID, "followers", String(session.user.uid)), {
                    followedAt: serverTimestamp(),
                    followedBy: session.user.uid
                });
                batch.set(doc(db, "users", String(session.user.uid), "following", userID), {
                    followedAt: serverTimestamp(),
                    followedBy: session.user.uid
                });
                batch.update(doc(db, "users", userID), { followersCount: increment(1) });
                batch.update(doc(db, "users", String(session.user.uid)), { followingCount: increment(1) });
            }

            await batch.commit();
        } catch (error) {
            console.error('Error updating follow:', error);
            throw error;
        }
    }, [session, followed, db, userID]);
};