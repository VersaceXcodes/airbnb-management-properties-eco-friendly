import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

// Define the expected structure of an eco rating record
interface EcoRating {
  property_id: string;
  eco_rating: number;
}

// Component to display eco-rating information
const UV_EcoRating: React.FC = () => {
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  
  // Use react-query to fetch eco-ratings
  const { data, isLoading, isError, refetch } = useQuery<EcoRating[], Error>(
    ['eco-ratings'],
    async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/eco-ratings`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });
      return data.map((rating: { property_id: string, eco_rating: number }) => ({
        property_id: rating.property_id,
        eco_rating: rating.eco_rating,
      }));
    },
    {
      enabled: !!auth_token, // Only run query if auth_token is present
    }
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Eco Ratings</h1>
          
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mb-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Ratings'}
          </button>

          {isError ? (
            <div className="text-red-600" aria-live="polite">
              Error loading eco ratings. Please try again later.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eco Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.map(({ property_id, eco_rating }) => (
                    <tr key={property_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {property_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {eco_rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link to="/manage-listings" className="mt-6 text-blue-600 hover:text-blue-800">
            Back to Manage Listings
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_EcoRating;