import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addNewPost, selectAllUsers } from "../../store";

export const AddPostForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [addRequestStatus, setAddRequestStatus] = useState('idle')

  const currentUserId = useSelector((state) => state.auth.value.username);
  const [userId, setUserId] = useState('')

  const users = useSelector((state) => selectAllUsers(state));

  const dispatch = useDispatch()

  const canSave =
    [title, content, userId].every(Boolean) && addRequestStatus === 'idle'

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)
  const onAuthorChanged = (e) => setUserId(e.target.value)
  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        setAddRequestStatus('pending')
        await dispatch(addNewPost({ title, content, user: userId })).unwrap()
        setTitle('')
        setContent('')
        setUserId(currentUserId)
      } catch (err) {
        console.error('Failed to save the post: ', err)
      } finally {
        setAddRequestStatus('idle')
      }
    }
  }

  console.log(users);
  const usersOptions = users?.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  )) || ''

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          {usersOptions}
        </select>
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button" onClick={onSavePostClicked}>Save Post</button>
      </form>
    </section>
  )
}
