import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

import UV_SignIn from '../components/views/UV_SignIn'
import UV_Register from '../components/views/UV_Register'
import { useAppStore } from '@/store/main'

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Auth E2E Flow (Vitest, real API)', () => {
  const uniqueEmail = `user${Date.now()}@example.com`
  const testPassword = 'SecureP@ssw0rd123'

  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState((state) => ({
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
  })

  it('completes full auth flow: register -> logout -> sign-in', async () => {
    const user = userEvent.setup()

    const { unmount: unmountRegister } = render(<UV_Register />, { wrapper: Wrapper })

    const registerEmailInput = await screen.findByLabelText(/email address/i)
    const registerPasswordInput = await screen.findByLabelText(/password/i)
    const registerButton = await screen.findByRole('button', { name: /create account/i })

    await waitFor(() => {
      expect(registerEmailInput).not.toBeDisabled()
      expect(registerPasswordInput).not.toBeDisabled()
    })

    await user.type(registerEmailInput, uniqueEmail)
    await user.type(registerPasswordInput, testPassword)

    await waitFor(() => expect(registerButton).not.toBeDisabled())
    await user.click(registerButton)

    await waitFor(() => expect(screen.getByText(/creating account/i)).toBeInTheDocument())

    await waitFor(
      () => {
        const state = useAppStore.getState()
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true)
        expect(state.authentication_state.auth_token).toBeTruthy()
        expect(state.authentication_state.user_email).toBe(uniqueEmail)
      },
      { timeout: 20000 }
    )

    const { logout } = useAppStore.getState()
    logout()

    await waitFor(() => {
      const state = useAppStore.getState()
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false)
      expect(state.authentication_state.auth_token).toBeNull()
      expect(state.authentication_state.user_email).toBeNull()
    })

    unmountRegister()

    render(<UV_SignIn />, { wrapper: Wrapper })

    const signInEmailInput = await screen.findByLabelText(/email address/i)
    const signInPasswordInput = await screen.findByLabelText(/password/i)
    const signInButton = await screen.findByRole('button', { name: /sign in to your account/i })

    await waitFor(() => {
      expect(signInEmailInput).not.toBeDisabled()
      expect(signInPasswordInput).not.toBeDisabled()
    })

    await user.type(signInEmailInput, uniqueEmail)
    await user.type(signInPasswordInput, testPassword)

    await waitFor(() => expect(signInButton).not.toBeDisabled())
    await user.click(signInButton)

    await waitFor(() => expect(screen.getByText(/signing in/i)).toBeInTheDocument())

    await waitFor(
      () => {
        const state = useAppStore.getState()
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true)
        expect(state.authentication_state.auth_token).toBeTruthy()
        expect(state.authentication_state.user_email).toBe(uniqueEmail)
      },
      { timeout: 20000 }
    )
  }, 60000)

  it('registers a new user successfully', async () => {
    const user = userEvent.setup()
    const newEmail = `newuser${Date.now()}@example.com`

    render(<UV_Register />, { wrapper: Wrapper })

    const emailInput = await screen.findByLabelText(/email address/i)
    const passwordInput = await screen.findByLabelText(/password/i)
    const submitButton = await screen.findByRole('button', { name: /create account/i })

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled()
      expect(passwordInput).not.toBeDisabled()
    })

    await user.type(emailInput, newEmail)
    await user.type(passwordInput, testPassword)

    await waitFor(() => expect(submitButton).not.toBeDisabled())
    await user.click(submitButton)

    await waitFor(() => expect(screen.getByText(/creating account/i)).toBeInTheDocument())

    await waitFor(
      () => {
        const state = useAppStore.getState()
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true)
        expect(state.authentication_state.auth_token).toBeTruthy()
      },
      { timeout: 20000 }
    )
  }, 30000)

  it('signs in with existing credentials', async () => {
    const user = userEvent.setup()
    const existingEmail = `existing${Date.now()}@example.com`

    const { unmount: unmountRegister } = render(<UV_Register />, { wrapper: Wrapper })
    const registerEmailInput = await screen.findByLabelText(/email address/i)
    const registerPasswordInput = await screen.findByLabelText(/password/i)
    const registerButton = await screen.findByRole('button', { name: /create account/i })

    await user.type(registerEmailInput, existingEmail)
    await user.type(registerPasswordInput, testPassword)
    await user.click(registerButton)

    await waitFor(
      () => {
        const state = useAppStore.getState()
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true)
      },
      { timeout: 20000 }
    )

    const { logout } = useAppStore.getState()
    logout()
    unmountRegister()

    render(<UV_SignIn />, { wrapper: Wrapper })

    const signInEmailInput = await screen.findByLabelText(/email address/i)
    const signInPasswordInput = await screen.findByLabelText(/password/i)
    const signInButton = await screen.findByRole('button', { name: /sign in to your account/i })

    await user.type(signInEmailInput, existingEmail)
    await user.type(signInPasswordInput, testPassword)
    await user.click(signInButton)

    await waitFor(
      () => {
        const state = useAppStore.getState()
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true)
        expect(state.authentication_state.auth_token).toBeTruthy()
      },
      { timeout: 20000 }
    )
  }, 40000)

  it('handles logout correctly', () => {
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: 'test-token',
        user_email: 'test@example.com',
        authentication_status: {
          is_authenticated: true,
          is_loading: false,
        },
      },
    }))

    const { logout } = useAppStore.getState()
    logout()

    const state = useAppStore.getState()
    expect(state.authentication_state.authentication_status.is_authenticated).toBe(false)
    expect(state.authentication_state.auth_token).toBeNull()
    expect(state.authentication_state.user_email).toBeNull()
  })
})
