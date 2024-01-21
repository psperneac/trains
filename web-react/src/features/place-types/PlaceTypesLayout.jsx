import {Route, Routes} from 'react-router-dom';

import { PlaceTypesList } from './PlaceTypesList';
import { AddPlaceTypeForm } from './AppPlaceTypeForm';
import { ViewPlaceType } from './ViewPlaceType';
import { EditPlaceTypeForm } from './EditPlaceTypeForm';

export const PlaceTypesLayout = () => {
  return (
    <div className="p-4">
      <div className="container">
        <Routes>
          <Route index element={<PlaceTypesList />}></Route>
          <Route path="add" element={<AddPlaceTypeForm />} />
          <Route path=":placeTypeId" element={<ViewPlaceType />} />
          <Route path="edit/:placeTypeId" element={<EditPlaceTypeForm />} />
        </Routes>
      </div>
    </div>
  );
}
