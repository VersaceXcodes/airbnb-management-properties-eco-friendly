import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

// Define based on API response from OpenAPI spec
interface Property {
  id: string;
  name: string;
  eco_rating: number;
  status: string;
}

const fetchProperties = async (token: string): Promise<Property[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/properties`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.map((property: any) => ({
    id: property.id,
    name: property.name,
    eco_rating: property.eco_rating,
    status: property.status,
  }));
};

const UV_ManageListings: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading, isError, error } = useQuery<Property[]>(['properties'], () => fetchProperties(authToken!), {
    enabled: !!authToken,
    onError: (err) => {
      console.error('Failed to fetch properties', err);
    },
  });

  const deletePropertyMutation = useMutation(
    (propertyId: string) => axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/properties/${propertyId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['properties']);
      },
    }
  );

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Manage Listings</h1>

          {isLoading && <p>Loading listings...</p>}
          {isError && <p>Error loading listings: {error?.message}</p>}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{property.name}</h2>
                <p>Eco Rating: {property.eco_rating}</p>
                <p>Status: {property.status}</p>
                <div className="mt-4 space-x-2">
                  <Link to={`/properties/edit/${property.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/properties/create"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create New Listing
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ManageListings;