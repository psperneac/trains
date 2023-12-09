import React from 'react';
import {Route, Routes} from 'react-router-dom';

import { VehicleTypesList } from './VehicleTypesList';
import { AddVehicleTypeForm } from './AppVehicleTypeForm';
import { ViewVehicleType } from './ViewVehicleType';
import { EditVehicleTypeForm } from './EditVehicleTypeForm';

export const VehicleTypesLayout = () => {
  return (
    <div className="p-4">
      <div className="container">
        <Routes>
          <Route index element={<VehicleTypesList />}></Route>
          <Route path="add" element={<AddVehicleTypeForm />} />
          <Route path=":vehicleTypeId" element={<ViewVehicleType />} />
          <Route path="edit/:vehicleTypeId" element={<EditVehicleTypeForm />} />
        </Routes>
      </div>
    </div>
  );
}
