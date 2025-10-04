import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UV_Auth from '@/components/views/UV_Auth';
import { useAppStore } from '@/store/main';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('UV_Auth E2E (Real API - Register -> Logout -> Sign In)', () => {
  const uniqueEmail = `user${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';
  const testName = 'Test User';

  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
      current_user: null,
      current_workspace: null,
    }));
  });

  it('completes full auth flow: register -> logout -> sign in', async () => {
    const user = userEvent.setup();

    render(<UV_Auth />, { wrapper: Wrapper });

    const switchButton = screen.getByRole('button', {
      name: /don't have an account\? register/i,
    });
    await user.click(switchButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await waitFor(() => {
      expect(nameInput).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    await user.type(nameInput, testName);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, testPassword);

    await waitFor(() => expect(registerButton).not.toBeDisabled());

    await user.click(registerButton);

    await waitFor(() =>
      expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument()
    );

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );

    const stateAfterRegister = useAppStore.getState();
    expect(stateAfterRegister.authentication_state.auth_token).toBeTruthy();
    expect(stateAfterRegister.current_user).toBeTruthy();

    await useAppStore.getState().logout();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      expect(state.authentication_state.auth_token).toBeNull();
      expect(state.current_user).toBeNull();
    });

    expect(localStorage.getItem('auth_token')).toBeNull();

    render(<UV_Auth />, { wrapper: Wrapper });

    const emailInputLogin = await screen.findByLabelText(/email address/i);
    const passwordInputLogin = await screen.findByLabelText(/password/i);
    const signInButton = await screen.findByRole('button', {
      name: /sign in to your account/i,
    });

    await waitFor(() => {
      expect(emailInputLogin).not.toBeDisabled();
      expect(passwordInputLogin).not.toBeDisabled();
    });

    await user.type(emailInputLogin, uniqueEmail);
    await user.type(passwordInputLogin, testPassword);

    await waitFor(() => expect(signInButton).not.toBeDisabled());

    await user.click(signInButton);

    await waitFor(() =>
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument()
    );

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );

    const finalState = useAppStore.getState();
    expect(finalState.authentication_state.auth_token).toBeTruthy();
    expect(finalState.current_user).toBeTruthy();
    expect(localStorage.getItem('auth_token')).toBeTruthy();
  }, 60000);

  it('registers a new user successfully', async () => {
    const user = userEvent.setup();
    const registerEmail = `register${Date.now()}@example.com`;

    render(<UV_Auth />, { wrapper: Wrapper });

    const switchButton = screen.getByRole('button', {
      name: /don't have an account\? register/i,
    });
    await user.click(switchButton);

    const nameInput = await screen.findByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(nameInput, 'New User');
    await user.type(emailInput, registerEmail);
    await user.type(passwordInput, testPassword);

    await waitFor(() => expect(registerButton).not.toBeDisabled());
    await user.click(registerButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );
  }, 30000);

  it('signs in with existing credentials', async () => {
    const user = userEvent.setup();
    const loginEmail = `signin${Date.now()}@example.com`;

    await useAppStore.getState().register(loginEmail, testPassword, 'Sign In User');

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
    });

    await useAppStore.getState().logout();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
    });

    render(<UV_Auth />, { wrapper: Wrapper });

    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    const signInButton = await screen.findByRole('button', {
      name: /sign in to your account/i,
    });

    await user.type(emailInput, loginEmail);
    await user.type(passwordInput, testPassword);

    await waitFor(() => expect(signInButton).not.toBeDisabled());
    await user.click(signInButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );
  }, 30000);

  it('logs out successfully', async () => {
    const logoutEmail = `logout${Date.now()}@example.com`;

    await useAppStore.getState().register(logoutEmail, testPassword, 'Logout User');

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
      expect(state.authentication_state.auth_token).toBeTruthy();
    });

    await useAppStore.getState().logout();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      expect(state.authentication_state.auth_token).toBeNull();
      expect(state.current_user).toBeNull();
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  }, 30000);
});
