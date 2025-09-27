import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

// Define type for eco-impact data
interface EcoImpactMetric {
  carbon_footprint: number;
  energy_efficiency: number;
  water_usage: number;
  waste_reduction: number;
}

interface EcoImpactData {
  property_id: string;
  metrics: EcoImpactMetric;
}

// Function to fetch eco impact data
const fetchEcoImpactAnalytics = async (authToken: string): Promise<EcoImpactData[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/reports/eco-impact`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return data.analytics.map((impact: any) => ({
    property_id: impact.property_id,
    metrics: impact.metrics,
  }));
};

const UV_EcoImpactAnalytics: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const { data: ecoImpactData, isLoading, isError, refetch } = useQuery<EcoImpactData[], Error>({
    queryKey: ['eco-impact-analytics'],
    queryFn: () => fetchEcoImpactAnalytics(authToken ?? ''),
    enabled: !!authToken,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!authToken) {
      refetch();
    }
  }, [authToken, refetch]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold leading-tight text-gray-900">Eco Impact Analytics</h1>
          </div>
        </header>
        <main className="flex-1">
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {isError && (
            <div className="text-center py-16">
              <p className="text-red-500">Error fetching eco-impact data. Please try again.</p>
            </div>
          )}
          {ecoImpactData && !isLoading && !isError && (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {/* Example visualization placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ecoImpactData.map((impact) => (
                  <div key={impact.property_id} className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-medium text-gray-900">Property ID: {impact.property_id}</h2>
                    <dl>
                      <dt className="font-semibold text-gray-700">Carbon Footprint:</dt>
                      <dd>{impact.metrics.carbon_footprint}</dd>
                      <dt className="font-semibold text-gray-700 mt-2">Energy Efficiency:</dt>
                      <dd>{impact.metrics.energy_efficiency}</dd>
                      <dt className="font-semibold text-gray-700 mt-2">Water Usage:</dt>
                      <dd>{impact.metrics.water_usage}</dd>
                      <dt className="font-semibold text-gray-700 mt-2">Waste Reduction:</dt>
                      <dd>{impact.metrics.waste_reduction}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-center mt-4">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            >
              Refresh Data
            </button>
          </div>
        </main>
        <footer className="bg-white mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-400">
              &larr; Back to Dashboard
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UV_EcoImpactAnalytics;
