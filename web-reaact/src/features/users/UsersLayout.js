import { Routes, Route } from 'react-router-dom';

import { AddEdit } from './AddEdit';
import {UsersList} from "./UsersList";
import {UserPage} from "./UserPage";

export { UsersLayout };

function UsersLayout() {
  return (
    <div className="p-4">
      <div className="container">
        <Routes>
          <Route index element={<UsersList />} />
          <Route path="add" element={<AddEdit />} />
          <Route path=":userId" element={<UserPage />} />
        </Routes>
      </div>
    </div>
  );
}
