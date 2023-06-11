import { useCallback } from 'react';
import { doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @description - Handles what happens when a user wants to follow or unfollow someone.
 * @returns {Object || undefined}
 */
export const useFollow = ({ session, followed, db, userID }) => {
    return useCallback(async () => {
        // If there's no "session", then the user is not logged in, meaning we should redirect them back to the feed page. Not really sure why they need to be redirected to that home page. Realistically, if they click this button, they should ACTUALLY be redirected to the "/auth" page to get them to signup. This goes for a bunch of other functions as well.
        // TODO: Redirect to "/auth" page
        if (!session) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/'
                }
            };
        }

        // If they click the button and they are FOLLOWING the author of the tweet, then they will UNFOLLOW the author of the tweet.
        if (followed) {
            // REMOVE the currently logged in user from the the tweet's author's "followers" list
            await deleteDoc(doc(db, "users", userID, "followers", String(session.user.uid)));
            // REMOVE the current author of this tweet from the currently logged in user's "following" list
            await deleteDoc(doc(db, "users", String(session.user.uid), "following", userID));
        } else {
            // Else if they click the button and they are NOT FOLLOWING the author of the tweet, then they will FOLLOW the author of the tweet.

            // ADD the currently logged in user as a follower in the tweet's author's "followers" list
            await setDoc(doc(db, "users", userID, "followers", String(session.user.uid)), {
                followedAt: serverTimestamp(),
                followedBy: session.user.uid
            });

            // ADD the current author of this tweet into the currently logged in user's "following" list
            await setDoc(doc(db, "users", String(session.user.uid), "following", userID), {
                followedAt: serverTimestamp(),
                followedBy: session.user.uid
            });
        }
    }, [session, followed, db, userID]);
};