import { useEffect } from 'react';
import Layout from '../../components/Layout';
import { usePlaceTypeStore } from '../../store/placeTypeStore';

export default function PlaceTypes() {
  const { placeTypes, loading, error, fetchPlaceTypes } = usePlaceTypeStore();

  useEffect(() => {
    fetchPlaceTypes();
  }, [fetchPlaceTypes]);

  return (
    <Layout title="Place Types">
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
              {placeTypes.map((pt, idx) => (
                <tr key={pt.type + '-' + idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pt.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pt.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pt.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-xs">{JSON.stringify(pt.content, null, 2)}</pre>
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