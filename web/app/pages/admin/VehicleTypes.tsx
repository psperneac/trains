import { useEffect } from 'react';
import Layout from '../../components/Layout';
import { useVehicleTypeStore } from '../../store/vehicleTypeStore';

export default function VehicleTypes() {
  const { vehicleTypes, loading, error, fetchVehicleTypes } = useVehicleTypeStore();

  useEffect(() => {
    fetchVehicleTypes();
  }, [fetchVehicleTypes]);

  return (
    <Layout title="Vehicle Types">
      <div className="bg-white shadow rounded-lg p-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicleTypes.map((vt, idx) => (
                <tr key={vt.type + '-' + idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{vt.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{vt.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{vt.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-xs">{JSON.stringify(vt.content, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
} 