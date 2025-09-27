import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import { useAppStore } from '@/store/main';
import { z } from 'zod';

const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  eco_rating: z.number(),
  amenities: z.array(z.string()),
});

type Property = z.infer<typeof propertySchema>;

const fetchProperties = async (filters: any): Promise<Property[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/properties`, {
    params: filters,
  });
  return data.map((property: any) => propertySchema.parse(property));
};

const UV_SearchListings: React.FC = () => {
  const [filters, setFilters] = useState({
    eco_rating_min: '',
    eco_rating_max: '',
    amenities: '',
    location: '',
  });

  // const ecoFilterState = useAppStore((state) => state.eco_filter_state);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const { data: listings, isLoading, isError } = useQuery<Property[], Error>({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    enabled: !!filters,
  });

  const handleSearch = () => {
    // Manually trigger a query refetch if necessary
    setFilters({ ...filters });
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold text-center">Search Eco-Friendly Properties</h1>

          <div className="mt-8">
            <div className="flex flex-wrap justify-center">
              <input
                type="number"
                placeholder="Min Eco-rating"
                className="m-2 p-2 border rounded"
                value={filters.eco_rating_min}
                onChange={(e) => updateFilter('eco_rating_min', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Eco-rating"
                className="m-2 p-2 border rounded"
                value={filters.eco_rating_max}
                onChange={(e) => updateFilter('eco_rating_max', e.target.value)}
              />
              <input
                type="text"
                placeholder="Amenities (comma separated)"
                className="m-2 p-2 border rounded"
                value={filters.amenities}
                onChange={(e) => updateFilter('amenities', e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="m-2 p-2 border rounded"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
              <button
                className="m-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            <div className="mt-8">
              {isLoading && <p className="text-center">Loading properties...</p>}
              {isError && <p className="text-center text-red-500">Error loading properties.</p>}

              {!isLoading && !isError && (listings ?? []).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(listings ?? []).map((listing) => (
                    <div key={listing.id} className="border p-4 rounded bg-gray-50">
                      <h2 className="font-bold">{listing.name}</h2>
                      <p>{listing.description}</p>
                      <p className="text-sm">Location: {listing.location}</p>
                      <p className="text-sm">Eco Rating: {listing.eco_rating}</p>
                      <p className="text-sm">Amenities: {listing.amenities.join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}

              {(listings ?? []).length === 0 && !isLoading && !isError && (
                <p className="text-center">No properties found.</p>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/" className="text-blue-500 hover:underline">
                Learn more about EcoHost
              </Link>
              <span className="mx-2">|</span>
              <Link to="/eco-guide" className="text-blue-500 hover:underline">
                Eco-Tips
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UV_SearchListings;