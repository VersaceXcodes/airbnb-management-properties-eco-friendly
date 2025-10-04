import { create } from 'zustand'

interface AuthenticationStatus {
  is_authenticated: boolean
  is_loading: boolean
}

interface AuthenticationState {
  auth_token: string | null
  authentication_status: AuthenticationStatus
  error_message: string | null
  user_email: string | null
}

interface AppState {
  authentication_state: AuthenticationState
  register: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => void
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const useAppStore = create<AppState>((set) => ({
  authentication_state: {
    auth_token: null,
    authentication_status: {
      is_authenticated: false,
      is_loading: false,
    },
    error_message: null,
    user_email: null,
  },

  register: async (email: string, password: string) => {
    set((state) => ({
      authentication_state: {
        ...state.authentication_state,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },
    }))

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()

      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          auth_token: data.token,
          user_email: email,
          authentication_status: {
            is_authenticated: true,
            is_loading: false,
          },
          error_message: null,
        },
      }))
    } catch (error) {
      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          authentication_status: {
            is_authenticated: false,
            is_loading: false,
          },
          error_message: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    set((state) => ({
      authentication_state: {
        ...state.authentication_state,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },
    }))

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign in failed')
      }

      const data = await response.json()

      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          auth_token: data.token,
          user_email: email,
          authentication_status: {
            is_authenticated: true,
            is_loading: false,
          },
          error_message: null,
        },
      }))
    } catch (error) {
      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          authentication_status: {
            is_authenticated: false,
            is_loading: false,
          },
          error_message: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
      throw error
    }
  },

  logout: () => {
    set((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        user_email: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
    }))
  },
}))
