import { DataApi, TAG } from './data.api.js';

const api = DataApi.injectEndpoints({
  endpoints: (build) => ({
    getVehicleTypes: build.query({
      query: () => 'vehicle-types',
      providesTags: (results = { data: [], total: 0, page: 0, pageSize: 10 }, _error, _arg) => {
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
  })
})

export const {
  useGetVehicleTypesQuery,
  useGetVehicleTypeQuery,
  useAddVehicleTypeMutation,
  useUpdateVehicleTypeMutation
} = api;
