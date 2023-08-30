import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {addAuthorizationHeader} from "../helpers/http";

export const PlaceTypeApi = createApi({
  reducerPath: 'placeTypes',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    prepareHeaders: addAuthorizationHeader
  }),
  tagTypes: ['PlaceTypes'],
  endpoints: (build) => ({
    getPlaceTypes: build.query({
        query: () => 'place-types'
    }),
    addPlaceType: build.mutation({
      query: (body) => ({
        url: `place-types`,
        method: 'POST',
        body,
      })
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetPlaceTypesQuery,
  useAddPlaceTypesMutation,
  endpoints,
  reducerPath,
  reducer,
  middleware
} = PlaceTypeApi;
