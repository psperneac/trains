import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {addAuthorizationHeader} from "../helpers/http";

export const PlaceTypeApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    prepareHeaders: addAuthorizationHeader
  }),
  tagTypes: ['PlaceType'],
  endpoints: (build) => ({
    getPlaceTypes: build.query({
        query: () => 'place-types',
        providesTags: (results = [], error, arg) => [
          'PlaceTypes',
          ...results.map(({id}) => ({ type: 'PlaceType', id}))
        ]
    }),
    getPlaceType: build.query({
      query: (id) => `place-types/${id}`,
      providesTags: (result, error, arg) => [{ type: 'PlaceType', id: arg }]
    }),
    addPlaceType: build.mutation({
      query: (body) => ({
        url: `place-types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'PlaceType', id: result?.id }]
    }),
    updatePlaceType: build.mutation({
      query: placeType => ({
        url: `place-types/${placeType.id}`,
        method: 'PUT',
        body: placeType
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'PlaceType', id: arg.id }]
    })
  }),
});

// Auto-generated hooks
export const {
  // place type
  useGetPlaceTypesQuery,
  useAddPlaceTypesMutation,
  useGetPlaceTypeQuery,
  useUpdatePlaceTypeMutation,

  endpoints,
  reducerPath,
  reducer,
  middleware
} = PlaceTypeApi;
