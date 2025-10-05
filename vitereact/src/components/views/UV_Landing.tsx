import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthDialog } from '@/components/ui/auth-dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/main';


const UV_Landing: React.FC = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);

  const landing_user_message = 'Welcome to EcoHost! Join us in creating eco-friendly stays.';

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-green-800">{landing_user_message}</h1>
            <p className="mt-4 text-lg text-gray-700">
              Discover a platform that connects you with eco-friendly properties and helps manage them to enhance sustainable lifestyles.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-800">Core Features</h2>
            <ul className="mt-2 list-disc list-inside text-gray-700">
              <li>Eco-Rating System</li>
              <li>Sustainability Reporting</li>
              <li>Green Inventory Management</li>
              <li>Enhanced Guest Communications</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-blue-500 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-blue-500 hover:bg-blue-700"
                >
                  Login / Sign Up
                </Button>
                <Link to="/search">
                  <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
                    Browse Properties
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-800">Success Stories</h2>
            <p className="mt-2 text-gray-700">
              Hear from property managers and travelers who have benefitted from our platform.
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
};

export default UV_Landing;