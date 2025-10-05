import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { createPropertyInputSchema } from '@/schema';

const UV_CreateListing: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [ecoRating, setEcoRating] = useState(0);

  const auth_token = useAppStore(state => state.authentication_state.auth_token);

  
  const mutation = useMutation({
    mutationFn: (newListing: any) => {
      return axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/properties`, newListing, {
        headers: {
          'Authorization': `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      // Reset form on success or navigate elsewhere as needed
      setName('');
      setDescription('');
      setLocation('');
      setAmenities([]);
      setEcoRating(0);
      // Add logic to redirect or update UI
    },
    onError: (error: any) => {
      console.error('Error creating property:', error);
      // Handle error appropriately
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs using Zod or equivalent
    const validated = createPropertyInputSchema.safeParse({ name, description, location, amenities });
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return;
    }

    mutation.mutate({
      name,
      description,
      location,
      amenities,
      eco_rating: ecoRating
    });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="max-w-md w-full space-y-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create New Property Listing
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {mutation.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" aria-live="polite">
                <p className="text-sm">Failed to create property: {(mutation.error as any).message}</p>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Property Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Property Name"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description" className="sr-only">Property Description</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Property Description"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="location" className="sr-only">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="amenities" className="sr-only">Amenities</label>
                <input
                  id="amenities"
                  name="amenities"
                  type="text"
                  value={amenities.join(', ')}
                  onChange={(e) => setAmenities(e.target.value.split(',').map(item => item.trim()))}
                  placeholder="Amenities (separate with commas)"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="ecoRating" className="sr-only">Eco Rating</label>
                <input
                  id="ecoRating"
                  name="ecoRating"
                  type="number"
                  min="0"
                  max="5"
                  value={ecoRating}
                  onChange={(e) => setEcoRating(Number(e.target.value))}
                  placeholder="Eco Rating (0-5)"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit New Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_CreateListing;