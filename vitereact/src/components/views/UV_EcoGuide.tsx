import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface EcoTip {
  category: string;
  tips: string[];
}

const fetchEcoGuide = async (): Promise<EcoTip[]> => {
  return [
    { category: 'Recycling', tips: ['Use recycling bins', 'Sort waste by category'] },
    { category: 'Energy Saving', tips: ['Turn off lights when not needed', 'Use energy-efficient appliances'] },
  ];
};

const UV_EcoGuide: React.FC = () => {
  const { data: eco_tips, isLoading, isError, error } = useQuery<EcoTip[], Error>({
    queryKey: ['eco_tips'],
    queryFn: fetchEcoGuide,
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Eco Guide</h1>

          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline">{error?.message}</span>
            </div>
          )}

          {!isLoading && !isError && eco_tips && eco_tips.length > 0 && (
            <div className="space-y-8">
              {eco_tips.map((tipCategory, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800">{tipCategory.category}</h2>
                  <ul className="list-disc pl-6 mt-3 space-y-1 text-gray-700">
                    {tipCategory.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link to="/search" className="text-blue-600 hover:underline">
              Explore eco-friendly properties
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_EcoGuide;
