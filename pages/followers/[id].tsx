import { collection, doc, DocumentData, getDoc, getDocs, query, where } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'

const Followers = () => {
  const { data: session } = useSession()
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { id } = router.query

  console.log(id)
  useEffect(() => {
    const getFollowers = async () => {
      const q = query(collection(db, "users"), where('tag', '==', String(id)))
      const querySnapshot = await getDocs(q)
      console.log(querySnapshot.docs)
      const userID = querySnapshot.docs[0].id

      const f = query(collection(db, "users", userID, "followers"))
      const queryFollowersSnapshot = await getDocs(f)
      const results = getAllFollowers(queryFollowersSnapshot)
      console.log(results)
    }
    getFollowers()
  }, [db, id, loading])

  const getAllFollowers = async (followerIDs) => {
    const followersArr = []

    for (let d of followerIDs.docs) {
      const docRef = doc(db, "users", d.id)
      const snap = await getDoc(docRef)
      followersArr.push(snap)
    }

    // followerIDs.forEach(async (followerID) => {
    //   const docRef = doc(db, "users", followerID.id)
    //   const snap = await getDoc(docRef)
    //   followersArr.push(snap)

    //   return false
    // })

    // const r = await Promise.all(followersArr)
    // console.log(r)

    console.log(followersArr)

    return followersArr
  }

  console.log(followers)

  return (
    <div>
      {followers.map((f) => {
        const follower = f.data()

        console.log(follower)

        return (
          <div key={follower.id}>{follower.tag}</div>
        )
      })}
    </div>
  )
}

export default Followers
