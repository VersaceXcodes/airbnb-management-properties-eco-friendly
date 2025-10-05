import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';
import { z } from 'zod';

// Zod schemas for type safety
const messageSchema = z.array(
  z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string()
  })
);

const feedbackInputSchema = z.object({
  property_id: z.string(),
  user_id: z.string(),
  feedback: z.string()
});

const UV_GuestManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Zustate store hooks
  const auth_token = useAppStore((state) => state.authentication_state.auth_token);
  const current_user = useAppStore((state) => state.authentication_state.current_user);

  // Local component states
  const [guestMessages, setGuestMessages] = useState<{ id: string; content: string; timestamp: string }[]>([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch guest messages
  const fetchGuestMessages = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/guest-messages`, {
        headers: {
          Authorization: `Bearer ${auth_token}`
        }
      });
      const validatedData = messageSchema.parse(data.messages);
      setGuestMessages(validatedData);
    } catch {
      setError('Failed to load guest messages');
    }
  };

  const { isLoading: messagesLoading } = useQuery({
    queryKey: ['guestMessages'],
    queryFn: fetchGuestMessages,
    enabled: !!auth_token,
  });

  // Submit feedback mutation
  const submitFeedback = async () => {
    try {
      const validatedInput = feedbackInputSchema.parse({
        property_id: selectedPropertyId,
        user_id: current_user?.id || '',
        feedback: feedbackContent
      });

      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/feedback`, validatedInput, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      });
      setFeedbackContent('');
      setSelectedPropertyId(null);
      alert('Feedback submitted successfully');
      return data;
    } catch {
      setError('Failed to submit feedback');
    }
  };

  const { mutate: submitFeedbackMutation, isPending: feedbackLoading } = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestMessages'] });
    }
  });

  // Fetch messages on component mount
  useEffect(() => {
    if (auth_token) {
      fetchGuestMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth_token]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <h1 className="text-center text-2xl font-bold mt-8 mb-4">Guest Management</h1>
        <div className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-2">Messages</h2>
            {messagesLoading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {error ? (
                  <div className="px-4 py-2 bg-red-50 text-red-600">{error}</div>
                ) : (
                  guestMessages.map((msg) => (
                    <div key={msg.id} className="p-4 border-b first:border-t last:border-b-0">
                      <p>{msg.content}</p>
                      <small className="text-gray-500">{new Date(msg.timestamp).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
            )}

            <h2 className="text-xl font-semibold mt-6 mb-2">Submit Feedback</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFeedbackMutation();
              }}
              className="bg-white shadow-md rounded-lg p-4"
            >
              <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                Property ID
              </label>
              <input
                type="text"
                id="property_id"
                value={selectedPropertyId ?? ''}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />

              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mt-3">
                Feedback
              </label>
              <textarea
                id="feedback"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />

              <button
                type="submit"
                disabled={feedbackLoading || !selectedPropertyId || !feedbackContent}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
              >
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">Back to Dashboard</Link>
        </div>
      </div>
    </>
  );
};

export default UV_GuestManagement;