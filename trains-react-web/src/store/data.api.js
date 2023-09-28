import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { addAuthorizationHeader } from '../helpers/http';

const TAG = {
  PLACE_TYPE: 'PlaceType',
  VEHICLE_TYPE: 'VehicleType'
};

const PLACE_TYPE_QUERIES = (build) => ({
  getPlaceTypes: build.query({
      query: () => 'place-types',
      providesTags: (results = [], _error, _arg) => {
        console.log(results, _error, _arg);

        return [
          'PlaceTypes',
          ...results.data.map(({id}) => ({ type: TAG.PLACE_TYPE, id}))
        ];
      }
  }),
  getPlaceType: build.query({
    query: (id) => `place-types/${id}`,
    providesTags: (_result, _error, arg) => [{ type: TAG.PLACE_TYPE, id: arg }]
  }),
  addPlaceType: build.mutation({
    query: (body) => ({
      url: `place-types`,
      method: 'POST',
      body,
    }),
    invalidatesTags: (result, _error, _arg) => [{ type: TAG.PLACE_TYPE, id: result?.id }]
  }),
  updatePlaceType: build.mutation({
    query: placeType => ({
      url: `place-types/${placeType.id}`,
      method: 'PUT',
      body: placeType
    }),
    invalidatesTags: (_result, _error, arg) => [{ type: TAG.PLACE_TYPE, id: arg.id }]
  })
});

const VEHICLE_TYPE_QUERIES = (build) => ({
  getVehicleTypes: build.query({
    query: () => 'vehicle-types',
    providesTags: (results = [], _error, _arg) => {
      console.log(results, _error, _arg);

      return [...results.data.map(({id}) => ({ type: TAG.VEHICLE_TYPE, id}))];
    }
  }),
  getVehicleType: build.query({
    query: (id) => `vehicle-types/${id}`,
    providesTags: (_result, _error, arg) => [{ type: TAG.VEHICLE_TYPE, id: arg }]
  }),
  addVehicleType: build.mutation({
    query: (body) => ({
      url: `vehicle-types`,
      method: 'POST',
      body,
    }),
    invalidatesTags: (result, _error, _arg) => [{ type: TAG.VEHICLE_TYPE, id: result?.id }]
  }),
  updateVehicleType: build.mutation({
    query: vehicleType => ({
      url: `vehicle-types/${vehicleType.id}`,
      method: 'PUT',
      body: vehicleType
    }),
    invalidatesTags: (_result, _error, arg) => [{ type: TAG.VEHICLE_TYPE, id: arg.id }]
  })
});


export const DataApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    prepareHeaders: addAuthorizationHeader
  }),
  tagTypes: [TAG.PLACE_TYPE, TAG.VEHICLE_TYPE],
  endpoints: (build) => ({
    ...PLACE_TYPE_QUERIES(build),
    ...VEHICLE_TYPE_QUERIES(build),
  }),
});

// Auto-generated hooks
export const {
  // place type
  useGetPlaceTypesQuery,
  useGetPlaceTypeQuery,
  useAddPlaceTypesMutation,
  useUpdatePlaceTypeMutation,

  // vehicle type
  useGetVehicleTypesQuery,
  useGetVehicleTypeQuery,
  useAddVehicleTypeMutation,
  useUpdateVehicleTypeMutation,

  endpoints,
  reducerPath,
  reducer,
  middleware
} = DataApi;
