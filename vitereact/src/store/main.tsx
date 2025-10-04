import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

interface EcoFilterState {
  eco_rating_min: number;
  eco_rating_max: number;
  amenities: string[];
  location: string | null;
}

interface AppState {
  authentication_state: AuthenticationState;
  eco_filter_state: EcoFilterState;
  
  // Auth Actions
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  update_user_profile: (userData: Partial<User>) => void;
  
  // Eco-filter actions
  set_eco_filters: (filters: Partial<EcoFilterState>) => void;
}

// Store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true, // Start as loading for initial authentication check
        },
        error_message: null,
      },
      eco_filter_state: {
        eco_rating_min: 0,
        eco_rating_max: 5,
        amenities: [],
        location: null,
      },

      // Auth Actions
      login_user: async (email: string, password: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/login`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
          const { user, auth_token } = response.data;

          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: auth_token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set((state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
          throw new Error(errorMessage);
        }
      },

      initialize_auth: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;
        
        if (!token) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }

        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/verify`, { headers: { Authorization: `Bearer ${token}` } });
          const { user } = response.data;

          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error) {
          set((state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        }
      },

      logout_user: () => {
        set((state) => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: null,
          },
        }));
      },

      // Eco-filter actions
      set_eco_filters: (filters: Partial<EcoFilterState>) => {
        set((state) => ({
          eco_filter_state: {
            ...state.eco_filter_state,
            ...filters,
          },
        }));
      },
    }),
    {
      name: 'ecohost-auth-storage',
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
            is_loading: false,
          },
          error_message: null,
        },
        eco_filter_state: state.eco_filter_state,
      }),
    }
  )
);