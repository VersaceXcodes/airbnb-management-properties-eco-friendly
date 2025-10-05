import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface SustainabilityReport {
  property_id: string;
  report_data: any; // Define a more specific type based on report structure
}

const fetchSustainabilityReports = async (authToken: string): Promise<SustainabilityReport[]> => {
  const { data } = await axios.get(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/reports/sustainability`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return data.reports.map((report: any) => ({
    property_id: report.property_id,
    report_data: report.data,
  }));
};

const UV_SustainabilityReports: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const { data: reports = [], isLoading, isError, refetch } = useQuery<SustainabilityReport[], Error>({
    queryKey: ['sustainabilityReports'],
    queryFn: () => fetchSustainabilityReports(authToken || ''),
    enabled: !!authToken,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading reports.</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Sustainability Reports</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => refetch()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              {/* Iterate over reports */}
              {reports.map((report) => (
                <div key={report.property_id} className="mb-6 p-4 bg-white shadow rounded-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Property ID: {report.property_id}</h2>
                  <p className="text-gray-600">Report Data: {JSON.stringify(report.report_data)}</p>
                  <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report.report_data))}`}
                    download={`report_${report.property_id}.json`}
                    className="text-blue-600 hover:underline mt-2 block"
                  >
                    Download Report
                  </a>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-white shadow px-4 py-4">
          <div className="max-w-7xl mx-auto text-center">
            <Link to="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UV_SustainabilityReports;