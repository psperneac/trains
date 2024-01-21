import React, {useEffect} from 'react'
import { Link } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import { TimeAgo } from '../../helpers/TimeAgo';
import { ReactionButtons } from './ReactionButtons';
import { PostAuthor } from './PostsAuthor';
import { AddPostForm } from './AddPostForm';

import {
  fetchPosts,
  selectPostIds,
  selectPostById
} from '../../store';
import CircularProgress from '@mui/material/CircularProgress';

let PostExcerpt = ({ postId }) => {
  const post = useSelector(state => selectPostById(state, postId))
  return (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

const PostExcerptMemo = React.memo(PostExcerpt);

export const PostsList = () => {

  const dispatch = useDispatch()
  const orderedPostIds = useSelector(selectPostIds)

  const postStatus = useSelector((state) => state.posts.status)
  const error = useSelector((state) => state.posts.error)

  useEffect(() => {
    if (postStatus === 'idle') {
      console.log('Loading posts')
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content

  if (postStatus === 'loading') {
    content = <CircularProgress />
  } else if (postStatus === 'succeeded') {
    // Sort posts in reverse chronological order by datetime string
    content = orderedPostIds.map(postId => (
      <PostExcerptMemo key={postId} postId={postId} />
    ))
  } else if (postStatus === 'error') {
    content = <div>{error}</div>
  }

  return (
    <section className="posts-list">
      <AddPostForm />
      <h2>Posts</h2>
      {content}
    </section>
  )
}
