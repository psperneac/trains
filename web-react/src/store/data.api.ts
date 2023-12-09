import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BaseQueryFn } from '@reduxjs/toolkit/src/query/baseQueryTypes';
import { EndpointBuilder, EndpointDefinitions } from '@reduxjs/toolkit/src/query/endpointDefinitions';
import {HEADER_AUTH} from '../constants';
import { AppState } from './index';

export const TAG = {
  PLACE_TYPE: 'PlaceType',
  VEHICLE_TYPE: 'VehicleType'
};

export const DataApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.REACT_APP_API_URL}`, prepareHeaders: (headers, {getState}) => {
      const state = getState() as AppState;
      console.log('BaseQuery - SetHeaders', state, state?.auth?.value?.authorization);
      headers.set(HEADER_AUTH, state?.auth?.value?.authorization);
    }
  }),
  tagTypes: [TAG.PLACE_TYPE, TAG.VEHICLE_TYPE],
  endpoints: (build) => ({
  }),
});

// Auto-generated hooks
export const {
  endpoints,
  reducerPath,
  reducer,
  middleware
} = DataApi;
