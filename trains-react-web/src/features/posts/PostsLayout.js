import { Routes, Route } from 'react-router-dom';
import { AddPostForm } from './AddPostForm';

import { PostsList } from "./PostsList";
import { ViewPostPage } from './ViewPostPage';
import { EditPostForm } from './EditPostForm';

function PostsLayout() {
  return (
    <div className="p-4">
      <div className="container">
        <Routes>
          <Route index element={<PostsList />} />
          <Route path="add" element={<AddPostForm />} />
          <Route path="view/:postId" element={<ViewPostPage />} />
          <Route path="edit/:postId" element={<EditPostForm />} />
        </Routes>
      </div>
    </div>
  );
}

export { PostsLayout };