import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import UV_Login from '@/components/views/UV_Login.tsx';
import { useAppStore } from '@/store/main';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E (register -> logout -> sign-in)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState((state) => ({
      ...state,
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: { is_authenticated: false, is_loading: false },
        error_message: null,
      },
    }));
  });

  it(
    'registers via API, signs in via UI, logs out, signs in again',
    async () => {
      const unique = Date.now();
      const email = `user${unique}@example.com`;
      const username = `user${unique}`;
      const password = 'P@ssw0rd123!';

      // 1) Register the user via the real backend API
      const registerResp = await axios.post(
        `${API_BASE}/auth/register`,
        {
          username,
          email,
          password_hash: password,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(registerResp.status).toBe(201);

      // 2) Render the auth view and sign in
      render(<UV_Login />, { wrapper: Wrapper });

      const emailInput = await screen.findByLabelText(/email address|email/i);
      const passwordInput = await screen.findByLabelText(/password/i);
      // Might be "Sign in" or other variant according to instructions
      const submitButton = await screen.findByRole('button', {
        name: /sign in|log in/i,
      });

      const user = userEvent.setup();
      await user.type(emailInput, email);
      await user.type(passwordInput, password);

      await waitFor(() => expect(submitButton).not.toBeDisabled());
      await user.click(submitButton);

      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(
            state.authentication_state.authentication_status.is_authenticated
          ).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
        },
        { timeout: 20000 }
      );

      // 3) Logout via Zustand action
      useAppStore.getState().logout_user();

      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(
          false
        );
        expect(state.authentication_state.auth_token).toBeNull();
      });

      // 4) Sign in again via UI
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.type(emailInput, email);
      await user.type(passwordInput, password);

      await waitFor(() => expect(submitButton).not.toBeDisabled());
      await user.click(submitButton);

      await waitFor(
        () => {
          const state = useAppStore.getState();
          expect(
            state.authentication_state.authentication_status.is_authenticated
          ).toBe(true);
          expect(state.authentication_state.auth_token).toBeTruthy();
        },
        { timeout: 20000 }
      );
    },
    60000
  );
});
