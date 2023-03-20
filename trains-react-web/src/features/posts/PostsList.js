import React from 'react'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { TimeAgo } from '../../helpers/TimeAgo';

export const PostsList = () => {
  const posts = useSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <p className="post-content">Author: {post.user ?? '<no user>'}</p>
      <TimeAgo timestamp={post.date} />
      <Link to={`view/${post.id}`} className="button muted-button">
        View Post
      </Link>
      <Link to={`edit/${post.id}`} className="button muted-button">Edit Post</Link>
    </article>
  ))

  return (
    <>
      <section className="posts-list">
        <h2>Posts</h2>
        {renderedPosts}
      </section>

      <Link to="./Add" className="btn btn-link">Add</Link>
    </>
  )
}
