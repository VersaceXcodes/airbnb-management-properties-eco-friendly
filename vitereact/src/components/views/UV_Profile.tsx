import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore, User } from '@/store/main';

const UV_Profile: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const updateUserProfileInStore = useAppStore(state => state.update_user_profile);

  const [bio, setBio] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchUserProfile = async (): Promise<User> => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data as User;
  };

  const { data: currentUser, isLoading, error } = useQuery<User, Error>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  React.useEffect(() => {
    if (currentUser) {
      setBio(currentUser.bio ?? '');
      setAvatarUrl(currentUser.avatar_url ?? '');
    }
  }, [currentUser]);

  const mutation = useMutation({
    mutationFn: async (profileUpdates: { bio: string | null; avatar_url: string | null }) => {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/profile`, profileUpdates, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    },
    onSuccess: () => {
      updateUserProfileInStore({ bio, avatar_url: avatarUrl });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ bio, avatar_url: avatarUrl });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Profile Settings</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Edit your profile details</p>
          </div>

          {isLoading ? (
            <div className="text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>Error loading profile</p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {(mutation as any).isError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700">
                  <p>{(mutation as any).error?.message || 'Error updating the profile'}</p>
                </div>
              )}

              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="bio" className="sr-only">Bio</label>
                  <input
                    id="bio"
                    name="bio"
                    type="text"
                    value={bio ?? ''}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Your Bio"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="avatar-url" className="sr-only">Avatar URL</label>
                  <input
                    id="avatar-url"
                    name="avatar-url"
                    type="url"
                    value={avatarUrl ?? ''}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Avatar URL"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={(mutation as any).isPending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {(mutation as any).isPending ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Profile;
