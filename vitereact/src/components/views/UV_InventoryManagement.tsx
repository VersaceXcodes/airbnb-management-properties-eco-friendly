import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

// Fetch inventory items
const fetchInventoryItems = async (authToken: string): Promise<InventoryItem[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/inventory`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity
  }));
};

const UV_InventoryManagement: React.FC = () => {
  const [authToken] = useAppStore(state => [state.authentication_state.auth_token]);

  const { data: inventoryItems, isLoading, isError, refetch } = useQuery<InventoryItem[], Error>(
    ['inventoryItems'],
    () => fetchInventoryItems(authToken as string),
    { enabled: !!authToken } // Only run if authToken is available
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Management</h2>

          {isLoading && (
            <p className="text-gray-700">Loading inventory items...</p>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              <p>Error fetching inventory items. Please try again.</p>
            </div>
          )}

          <button
            onClick={() => refetch()}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Refresh Inventory
          </button>
          
          {inventoryItems && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.quantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                      {item.quantity} {item.quantity < 10 && " - Low Stock"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-6">
            <Link to="/supplier-recommendations" className="text-blue-600 hover:text-blue-500">
              View recommended suppliers for restocking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_InventoryManagement;