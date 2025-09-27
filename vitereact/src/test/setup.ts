import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Use the same API base as the app/tests
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// In-memory user store for test flows
let registeredUser: null | {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
} = null;

const handlers = [
  // Register
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      email: string;
      password_hash: string;
    };

    // Simulate basic validation like the backend
    if (!body?.username || !body?.email || !body?.password_hash) {
      return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
    }

    registeredUser = {
      id: Date.now(),
      username: body.username.toLowerCase(),
      email: body.email.toLowerCase(),
      password_hash: body.password_hash,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        auth_token: 'test-token',
        user: {
          id: registeredUser.id,
          username: registeredUser.username,
          email: registeredUser.email,
          created_at: registeredUser.created_at,
        },
      },
      { status: 201 }
    );
  }),

  // Login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (
      !registeredUser ||
      body.email?.toLowerCase() !== registeredUser.email ||
      body.password !== registeredUser.password_hash
    ) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 400 });
    }

    return HttpResponse.json({
      auth_token: 'test-token',
      user: {
        id: registeredUser.id,
        username: registeredUser.username,
        email: registeredUser.email,
        created_at: registeredUser.created_at,
      },
    });
  }),

  // Verify token
  http.get(`${API_BASE}/auth/verify`, async ({ request }) => {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer')) {
      return HttpResponse.json({ message: 'Access token required' }, { status: 401 });
    }
    if (!registeredUser) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      user: {
        id: registeredUser.id,
        username: registeredUser.username,
        email: registeredUser.email,
        created_at: registeredUser.created_at,
      },
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
