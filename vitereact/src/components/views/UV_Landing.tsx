import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main'; // For Zustand state

const UV_Landing: React.FC = () => {
  const { is_authenticated } = useAppStore((state) => state.authentication_state.authentication_status);
  const landing_user_message = 'Welcome to EcoHost! Join us in creating eco-friendly stays.';

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Welcome message with an eco-friendly focus */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-green-800">{landing_user_message}</h1>
            <p className="mt-4 text-lg text-gray-700">
              Discover a platform that connects you with eco-friendly properties and helps manage them to enhance sustainable lifestyles.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-800">Core Features</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700">
              <li>Eco-Rating System</li>
              <li>Sustainability Reporting</li>
              <li>Green Inventory Management</li>
              <li>Enhanced Guest Communications</li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="flex justify-center space-x-4 mt-6">
            <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login
            </Link>
            <Link to="/sign-up" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Sign Up
            </Link>
          </div>

          {/* Testimonials or success stories placeholder */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-800">Success Stories</h2>
            <p className="mt-2 text-gray-700">
              Hear from property managers and travelers who have benefitted from our platform.
            </p>
            {/* Testimonial content can be expanded here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Landing;