import DataTable, { TableColumn } from 'react-data-table-component';

import {useGetVehicleTypesQuery} from '../../store/data.api';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { VehicleType } from '../../data/vehicle-type.model';
import { useNavigate } from 'react-router-dom';
import './VehicleTypesList.scss';
import { useState } from 'react';

export const VehicleTypesList = () => {
  const { data, isFetching, isLoading } = useGetVehicleTypesQuery();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  console.log('GetVehicles data', data, isFetching, isLoading);

  if (isFetching) {
    return (<div>
      <h1>VehicleTypesList</h1>
      <p>Is Fetching</p>
    </div>);
  }

  if (isLoading) {
    return  (<div>
      <h1>VehicleTypesList</h1>
      <p>Is Loading</p>
    </div>);
  }

  function handleEdit(state) {
    navigate(`edit/${state.target.id}`);
  }

  function handleAdd() {
    navigate('add');
  }

  function handleSelectedRowcChange({ selectedRows }) {
    console.log('handleSelectedRowcChange', selectedRows);
    setSelected(selectedRows.map(row => row.id));
  }

  const columns: TableColumn<VehicleType>[] = [
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
      <h1>{t('vehicle-types.title')}</h1>
      <DataTable
        columns={columns}
        data={data.data}
        selectableRows
        onSelectedRowsChange={handleSelectedRowcChange}
      />
      <div className='buttons-container'>
        <Button variant='outline-danger' 
                size='sm' 
                className='delete-button' 
                disabled={!selected || selected.length === 0}>{t('main.delete')}</Button>
        <Button variant='outline-primary' size='sm' className='add-button' onClick={handleAdd}>{t('main.add')}</Button>
      </div>
    </>
  );
}
