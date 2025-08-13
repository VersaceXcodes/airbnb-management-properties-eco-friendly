import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

/* View Imports */
import GV_TopNavigation from '@/components/views/GV_TopNavigation.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';
import UV_Landing from '@/components/views/UV_Landing.tsx';
import UV_Dashboard from '@/components/views/UV_Dashboard.tsx';
import UV_ManageListings from '@/components/views/UV_ManageListings.tsx';
import UV_CreateListing from '@/components/views/UV_CreateListing.tsx';
import UV_CalendarManagement from '@/components/views/UV_CalendarManagement.tsx';
import UV_EcoRating from '@/components/views/UV_EcoRating.tsx';
import UV_InventoryManagement from '@/components/views/UV_InventoryManagement.tsx';
import UV_GuestManagement from '@/components/views/UV_GuestManagement.tsx';
import UV_SustainabilityReports from '@/components/views/UV_SustainabilityReports.tsx';
import UV_EcoImpactAnalytics from '@/components/views/UV_EcoImpactAnalytics.tsx';
import UV_Profile from '@/components/views/UV_Profile.tsx';
import UV_SearchListings from '@/components/views/UV_SearchListings.tsx';
import UV_EcoGuide from '@/components/views/UV_EcoGuide.tsx';
import UV_FeedbackSubmit from '@/components/views/UV_FeedbackSubmit.tsx';

const queryClient = new QueryClient();

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore(state => state.initialize_auth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          <GV_TopNavigation />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<UV_Landing />} />
              <Route path="/search" element={<UV_SearchListings />} />
              <Route path="/eco-guide" element={<UV_EcoGuide />} />
              <Route path="/feedback" element={<UV_FeedbackSubmit />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UV_Dashboard /></ProtectedRoute>} />
              <Route path="/properties/manage" element={<ProtectedRoute><UV_ManageListings /></ProtectedRoute>} />
              <Route path="/properties/create" element={<ProtectedRoute><UV_CreateListing /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><UV_CalendarManagement /></ProtectedRoute>} />
              <Route path="/rating" element={<ProtectedRoute><UV_EcoRating /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><UV_InventoryManagement /></ProtectedRoute>} />
              <Route path="/guest" element={<ProtectedRoute><UV_GuestManagement /></ProtectedRoute>} />
              <Route path="/reports/sustainability" element={<ProtectedRoute><UV_SustainabilityReports /></ProtectedRoute>} />
              <Route path="/reports/eco-impact" element={<ProtectedRoute><UV_EcoImpactAnalytics /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UV_Profile /></ProtectedRoute>} />

              {/* Redirect to Landing Page as Default Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;