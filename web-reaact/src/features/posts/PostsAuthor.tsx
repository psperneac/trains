import { useSelector } from 'react-redux'
import { AppState } from '../../store';

export const PostAuthor = ({ userId }) => {
  const author = useSelector((state: AppState) =>
    state.users?.list?.value?.find((user) => user.id === userId)
  )

  return <span>by {author ? author.name : 'Unknown author'}</span>
}
