import { PagedResult, PlaceType } from '../data';
import { DataApi, TAG } from './data.api';

const api = DataApi.injectEndpoints({
  endpoints: (build) => ({
    getPlaceTypes: build.query<PagedResult<PlaceType>, void>({
      query: () => 'place-types',
      // queryFn: async (args, api, extraOptions, baseQuery) => {
      //   const state = api.getState();

      // },
      providesTags: (results = { data: [], total: 0, page: 0, pageSize: 10 }, _error, _arg) => {
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
  })
});

export const {
  useGetPlaceTypesQuery,
  useGetPlaceTypeQuery,
  useAddPlaceTypeMutation,
  useUpdatePlaceTypeMutation
} = api;