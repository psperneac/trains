import {useGetPlaceTypesQuery} from "../../store/place-type.api";

export const PlaceTypesList = () => {
  const { data, isFetching, isLoading } = useGetPlaceTypesQuery();

  console.log('GetPlaces data', data);

  return (<div>
    <h1>PlaceTypesList</h1>
    <p>Is Fetching {isFetching ? 'Fetching' : 'Not Fetching'}</p>
    <p>Is Loading {isLoading ? 'Loading' : 'Not Loading'}</p>
  </div>);
}
