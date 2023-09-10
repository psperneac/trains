import DataTable, { TableColumn } from 'react-data-table-component';

import {useGetPlaceTypesQuery} from '../../store/data.api';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { PlaceType } from '../../data/place-type.model';
import { useNavigate } from 'react-router-dom';
import './PlaceTypesList.scss';

export const PlaceTypesList = () => {
  const { data, isFetching, isLoading } = useGetPlaceTypesQuery();
  const { t } = useTranslation('common');
  const navigate = useNavigate(); 

  console.log('GetPlaces data', data, isFetching, isLoading);

  if (isFetching) {
    return (<div>
      <h1>PlaceTypesList</h1>
      <p>Is Fetching</p>
    </div>);
  }

  if (isLoading) {
    return  (<div>
      <h1>PlaceTypesList</h1>
      <p>Is Loading</p>
    </div>);
  }

  function handleEdit(state) {
    navigate(`edit/${state.target.id}`);
  }

  const columns: TableColumn<PlaceType>[] = [
    {
      name: 'Type',
      selector: row => row.type,
      sortable: true
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true
    },
    {
      name: 'Edit',
      button: true,
      cell: (row) => <Button variant='outline-primary' size='sm' onClick={handleEdit} id={row.id}>Edit</Button>,
    }
  ];

  return (
    <>
      <h1>{t('place-types.title')}</h1>
      <DataTable
        columns={columns}
        data={data.data}
        selectableRows
      />
      <div className='buttons-container'>
        <Button variant='outline-danger' size='sm' className='delete-button'>{t('main.delete')}</Button>
        <Button variant='outline-primary' size='sm' className='add-button'>{t('main.add')}</Button>
      </div>
    </>
  );
}
