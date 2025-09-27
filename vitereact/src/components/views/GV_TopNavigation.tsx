import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_TopNavigation: React.FC = () => {
  const authenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const location = useLocation();

  const getHighlighted = (): 'home' | 'properties' | 'reports' | 'messages' | 'profile' | null => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'home';
    if (p.startsWith('/properties')) return 'properties';
    if (p.startsWith('/reports')) return 'reports';
    if (p.startsWith('/guest')) return 'messages';
    if (p.startsWith('/profile')) return 'profile';
    return null;
  };

  const highlightedSection = getHighlighted();

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
              >
                Home
              </Link>
              <Link 
                to="/properties/manage"
                className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'properties' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                aria-current={highlightedSection === 'properties' ? 'page' : undefined}
              >
                Properties
              </Link>
              {authenticated && (
                <>
                  <Link 
                    to="/reports/sustainability"
                    className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'reports' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    aria-current={highlightedSection === 'reports' ? 'page' : undefined}
                  >
                    Reports
                  </Link>
                  <Link 
                    to="/guest"
                    className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'messages' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    aria-current={highlightedSection === 'messages' ? 'page' : undefined}
                  >
                    Messages
                  </Link>
                </>
              )}
              <Link 
                to="/profile"
                className={`ml-8 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${highlightedSection === 'profile' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                aria-current={highlightedSection === 'profile' ? 'page' : undefined}
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
