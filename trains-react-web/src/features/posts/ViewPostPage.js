import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom';
import {selectPostById} from "../../store/posts.slice";

export const ViewPostPage = () => {
  const { postId } = useParams();

  const post = useSelector(state => selectPostById(state, postId));

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
        <p className="post-content">Author: {post.user ?? '<no user>'}</p>
      </article>
      <Link to="/posts">Back to Posts</Link>
      <Link to={`../edit/${postId}`}>Edit</Link>
    </section>
  )
}
