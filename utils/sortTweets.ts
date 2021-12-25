export const sortByNewest = (tweetsToSort: any) => {
  const tweetsToSortClone = [...tweetsToSort]

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    console.log(tweetOne)

    let timestampOne = tweetOne.data().retweetedAt ? tweetOne.data().retweetedAt.seconds : tweetOne.data().timestamp.seconds

    let timestampTwo = tweetTwo.retweetedAt ? tweetTwo.data().retweetedAt.seconds : tweetTwo.data().timestamp.seconds

    return timestampOne > timestampTwo ? -1 : 1
  })
}

export const sortByOldest = (tweetsToSort: any) => {
  const tweetsToSortClone = [...tweetsToSort]

  return tweetsToSortClone.sort((tweetOne, tweetTwo) => {
    console.log(tweetOne)

    let timestampOne = tweetOne.data().retweetedAt ? tweetOne.data().retweetedAt.seconds : tweetOne.data().timestamp.seconds

    let timestampTwo = tweetTwo.retweetedAt ? tweetTwo.data().retweetedAt.seconds : tweetTwo.data().timestamp.seconds

    return timestampOne > timestampTwo ? 1 : -1
  })
}