import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_TopNavigation: React.FC = () => {
  const authenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const highlightedSection = useAppStore(state => state.highlighted_section);
  const setHighlightedSection = (section: 'home' | 'properties' | 'reports' | 'messages' | 'profile') => {
    // Assuming a function to set highlighted section exists in Zustand store
    console.log(`Navigating to section: ${section}`);
  };

  return (
    <>
      <nav className="fixed w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'home' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                aria-current={highlightedSection === 'home' ? 'page' : undefined}
                onClick={() => setHighlightedSection('home')}
              >
                Home
              </Link>
              <Link 
                to="/properties/manage"
                className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'properties' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                aria-current={highlightedSection === 'properties' ? 'page' : undefined}
                onClick={() => setHighlightedSection('properties')}
              >
                Properties
              </Link>
              {authenticated && (
                <>
                  <Link 
                    to="/reports/sustainability"
                    className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'reports' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    aria-current={highlightedSection === 'reports' ? 'page' : undefined}
                    onClick={() => setHighlightedSection('reports')}
                  >
                    Reports
                  </Link>
                  <Link 
                    to="/guest"
                    className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'messages' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    aria-current={highlightedSection === 'messages' ? 'page' : undefined}
                    onClick={() => setHighlightedSection('messages')}
                  >
                    Messages
                  </Link>
                </>
              )}
              <Link 
                to="/profile"
                className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'profile' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                aria-current={highlightedSection === 'profile' ? 'page' : undefined}
                onClick={() => setHighlightedSection('profile')}
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default GV_TopNavigation;