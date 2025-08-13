import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface EcoMetrics {
  carbon_footprint: number;
  water_savings: number;
}

interface Notification {
  message: string;
  type: string;
}

const fetchDashboardData = async (token: string): Promise<EcoMetrics> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/dashboard/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    carbon_footprint: data.eco_metrics.carbon_footprint,
    water_savings: data.eco_metrics.water_savings,
  };
};

const UV_Dashboard: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  const { data: ecoMetrics, isLoading, isError } = useQuery<EcoMetrics, Error>(
    ['dashboardData'],
    () => fetchDashboardData(authToken || ''),
    { enabled: !!authToken }
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulated notifications
    setNotifications([
      { message: 'Low inventory on cleaning supplies', type: 'alert' },
      { message: 'New guest booking received', type: 'info' },
    ]);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center h-screen text-red-600">Error fetching dashboard data.</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-6">
              <Link to="/profile" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Profile
              </Link>
              <Link to="/manage-listings" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Manage Listings
              </Link>
              <Link to="/logout" className="text-base font-medium text-red-600 hover:text-red-900">
                Logout
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Welcome, {currentUser?.name}</h2>
                <p>Your Eco Metrics:</p>
                <ul className="mt-2">
                  <li className="text-green-600">Carbon Footprint: {ecoMetrics?.carbon_footprint} tons</li>
                  <li className="text-blue-600">Water Savings: {ecoMetrics?.water_savings} liters</li>
                </ul>
              </div>

              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <ul>
                  {notifications.map((notification, index) => (
                    <li key={index} className={`p-2 mb-3 border rounded ${notification.type === 'alert' ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500'}`}>
                      {notification.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_Dashboard;