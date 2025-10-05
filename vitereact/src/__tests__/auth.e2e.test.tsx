import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UV_Login from '@/components/views/UV_Login';
import { useAppStore } from '@/store/main';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E Tests (Real API)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        current_user: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
    }));
  });

  it('registers a new user successfully', async () => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    const uniqueUsername = `user${Date.now()}`;
    const password = 'testpassword123';

    render(<UV_Login />, { wrapper: Wrapper });

    const toggleButton = await screen.findByRole('button', { name: /don't have an account\? sign up/i });
    const user = userEvent.setup();
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await waitFor(() => {
      expect(nameInput).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    await user.type(nameInput, uniqueUsername);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);

    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail.toLowerCase());
      },
      { timeout: 20000 }
    );
  }, 30000);

  it('completes full auth flow: register -> logout -> login', async () => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    const uniqueUsername = `user${Date.now()}`;
    const password = 'testpassword123';

    render(<UV_Login />, { wrapper: Wrapper });
    const user = userEvent.setup();

    const toggleButton = await screen.findByRole('button', { name: /don't have an account\? sign up/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/full name/i);
    let emailInput = screen.getByPlaceholderText(/email address/i);
    let passwordInput = screen.getByPlaceholderText(/password/i);
    let submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(nameInput, uniqueUsername);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);
    await user.click(submitButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );

    const logoutUser = useAppStore.getState().logout_user;
    logoutUser();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      expect(state.authentication_state.auth_token).toBeNull();
      expect(state.authentication_state.current_user).toBeNull();
    });

    cleanup();
    render(<UV_Login />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });

    emailInput = screen.getByPlaceholderText(/email address/i);
    passwordInput = screen.getByPlaceholderText(/password/i);
    submitButton = screen.getByRole('button', { name: /sign in/i });

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);

    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail.toLowerCase());
      },
      { timeout: 20000 }
    );
  }, 45000);

  it('shows error message for invalid login credentials', async () => {
    render(<UV_Login />, { wrapper: Wrapper });

    const emailInput = await screen.findByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.error_message).toBeTruthy();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 10000 }
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  }, 20000);

  it('persists auth state in localStorage', async () => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    const uniqueUsername = `user${Date.now()}`;
    const password = 'testpassword123';

    render(<UV_Login />, { wrapper: Wrapper });
    const user = userEvent.setup();

    const toggleButton = await screen.findByRole('button', { name: /don't have an account\? sign up/i });
    await user.click(toggleButton);

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(nameInput, uniqueUsername);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);
    await user.click(submitButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
      },
      { timeout: 20000 }
    );

    const storedData = localStorage.getItem('ecohost-auth-storage');
    expect(storedData).toBeTruthy();

    const parsedData = JSON.parse(storedData!);
    expect(parsedData.state.authentication_state.auth_token).toBeTruthy();
    expect(parsedData.state.authentication_state.current_user.email).toBe(uniqueEmail.toLowerCase());
  }, 30000);
});
