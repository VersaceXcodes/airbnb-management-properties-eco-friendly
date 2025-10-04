# Auth E2E Tests

## Overview
Real API E2E authentication tests for Vite+React+TypeScript application using Vitest.

## Test Flow
The tests cover the complete authentication lifecycle:
1. **Register** - Create a new user account
2. **Logout** - Clear authentication state
3. **Sign In** - Log back in with existing credentials

## Setup

### Prerequisites
- Backend API running at `http://localhost:3000` (configured in `.env.test`)
- Database with users table supporting email/password auth

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run specific test file
npm test auth.e2e.test
```

## Test Configuration

### Files Created
- `vitest.config.ts` - Vitest configuration with jsdom environment
- `src/test/setup.ts` - Test setup with @testing-library/jest-dom
- `.env.test` - Test environment variables (API_BASE_URL)
- `src/__tests__/auth.e2e.test.tsx` - E2E auth test suite
- `src/store/main.tsx` - Zustand auth store
- `src/components/views/UV_SignIn.tsx` - Sign-in component
- `src/components/views/UV_Register.tsx` - Register component

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Test Implementation

### Key Features
- **No API Mocking** - Tests hit real backend endpoints
- **Unique Emails** - Uses timestamp-based emails to avoid conflicts
- **Store Assertions** - Verifies Zustand state changes
- **Resilient Selectors** - Flexible label/button matching
- **Timeout Handling** - 20s timeout for API calls, 60s for full flow

### Expected API Endpoints
```
POST /api/auth/register
  Body: { email, password }
  Response: { token }

POST /api/auth/login
  Body: { email, password }
  Response: { token }
```

### Store State Shape
```typescript
{
  authentication_state: {
    auth_token: string | null
    user_email: string | null
    authentication_status: {
      is_authenticated: boolean
      is_loading: boolean
    }
    error_message: string | null
  }
}
```

## Test Cases

1. **Full Auth Flow** - Register → Logout → Sign In (60s timeout)
2. **Registration** - New user registration (30s timeout)
3. **Sign In** - Existing user login (40s timeout)
4. **Logout** - State cleanup (unit test)

## Notes

- Each test uses a unique email: `user${Date.now()}@example.com`
- Password: `SecureP@ssw0rd123` (for demo purposes)
- All tests reset localStorage and store state before running
- Loading states are verified during async operations
- Success is confirmed by checking store authentication state

## Troubleshooting

### Backend Not Running
Ensure your backend server is running on port 3000:
```bash
# Start your backend server
cd /app/backend
npm start
```

### Tests Timing Out
- Increase timeout in test: `it('test', async () => {...}, 90000)`
- Check API response times
- Verify database connection

### Email Conflicts
The tests use timestamped emails, but if running tests in parallel:
- Consider adding random suffix: `user${Date.now()}_${Math.random()}@example.com`
- Implement test cleanup to delete test users
