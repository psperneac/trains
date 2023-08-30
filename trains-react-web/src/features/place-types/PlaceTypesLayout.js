import {Route, Routes} from "react-router-dom";
import {PlaceTypesList} from "./PlaceTypesList";

export const PlaceTypesLayout = () => {
  return (
    <div className="p-4">
      <div className="container">
        <Routes>
          <Route index element={<PlaceTypesList />}></Route>
        </Routes>
      </div>
    </div>
  );
}
