import DataTable from 'react-data-table-component';

import {useGetVehicleTypesQuery} from '../../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './VehicleTypesList.scss';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

export const VehicleTypesList = () => {
  const { data, isFetching, isLoading } = useGetVehicleTypesQuery(); //
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

  function handleSelectedRowChange({ selectedRows }) {
    console.log('handleSelectedRowChange', selectedRows);
    setSelected(selectedRows.map(row => row.id));
  }

  const columns = [
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
      cell: (row) => <Button onClick={handleEdit} id={row.id}>Edit</Button>,
    }
  ];

  return (
    <>
      <h1>{t('vehicle-types.title')}</h1>
      <DataTable
        columns={columns}
        data={data.data}
        selectableRows
        onSelectedRowsChange={handleSelectedRowChange}
      />
      <div className='buttons-container'>
        <Button className='delete-button' 
                disabled={!selected || selected.length === 0}>{t('main.delete')}</Button>
        <Button className='add-button' onClick={handleAdd}>{t('main.add')}</Button>
      </div>
    </>
  );
}
