import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { z } from 'zod';
import { commentSchema } from '@/DB/zodschemas';
import { Link } from 'react-router-dom';

const UV_FeedbackSubmit: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Zustand selectors
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const currentUser = useAppStore((state) => state.authentication_state.current_user);

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      try {
        commentSchema.comment.parse(feedback); // Validate feedback text
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/feedback`,
          { feedback: feedback, user_id: currentUser?.id },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.status === 201) {
          setSubmissionSuccess(true);
          setFeedback(''); // Reset form
        }
      } catch (error: any) {
        setErrorMsg(error.response?.data?.message || 'Failed to submit feedback');
      }
    },
    onError: (error) => {
      setErrorMsg('An error occurred during submission. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); // Clear any existing errors
    submitFeedbackMutation.mutate(); // Trigger mutation
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6">
        <div className="max-w-lg w-full space-y-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Share Your Eco-Experience
          </h2>
          {submissionSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md" role="alert" aria-live="polite">
              <p className="text-sm">Thank you for your feedback! Your insights help us improve.</p>
              <Link to='/properties/manage' className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block">
                Manage Your Listings
              </Link>
            </div>
          )}
          {!submissionSuccess && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}
              <div>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={4}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Share your thoughts on the eco-friendliness of your stay..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_FeedbackSubmit;