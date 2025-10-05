import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useMapStore } from '../../store/mapStore';
import type { MapDto } from '../../types/map';
import { MapType } from '../../types/map';

export default function MapForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { maps, loading, error, fetchMaps, addMap, updateMap } = useMapStore();
  const [formData, setFormData] = useState<Omit<MapDto, 'id'>>({
    name: '',
    description: '',
    type: MapType.TEMPLATE,
    places: [],
    placeConnections: [],
    content: {}
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && maps.length > 0) {
      const map = maps.find(m => m.id === id);
      if (map) {
        setFormData({
          name: map.name,
          description: map.description,
          type: map.type,
          places: map.places || [],
          placeConnections: map.placeConnections || [],
          content: map.content || {}
        });
      }
    }
  }, [id, maps, isEditing]);

  useEffect(() => {
    if (isEditing) {
      fetchMaps(1, 1000); // Fetch all maps to find the one to edit
    }
  }, [fetchMaps, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await updateMap({ ...formData, id });
      } else {
        await addMap(formData);
      }
      navigate('/admin/maps');
    } catch (err) {
      console.error('Error saving map:', err);
    }
  };

  const handleChange = (field: keyof Omit<MapDto, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading map...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Map' : 'Add New Map'}
            </h1>
            <button
              onClick={() => navigate('/admin/maps')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Back to Maps
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as MapType)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={MapType.TEMPLATE}>Template</option>
                <option value={MapType.GAME}>Game</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content (JSON)
              </label>
              <textarea
                id="content"
                value={JSON.stringify(formData.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleChange('content', parsed);
                  } catch {
                    // Invalid JSON, keep the string value
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="{}"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/maps')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isEditing ? 'Update Map' : 'Create Map'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 