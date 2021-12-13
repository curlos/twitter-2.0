import React from 'react'

interface Props {
  post: any
}

const TweetReplyContent = ({ post }: Props) => {
  return (
    <div>
      {post.text}
      <img src={post.image} alt="" className="rounded-2xl max-h-80 object-contain" />
    </div>
  )
}

export default TweetReplyContent
