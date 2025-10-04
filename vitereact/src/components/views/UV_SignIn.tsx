import React, { useState } from 'react'
import { useAppStore } from '@/store/main'

const UV_SignIn: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, authentication_state } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const isLoading = authentication_state.authentication_status.is_loading
  const isDisabled = isLoading || !email || !password

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        {authentication_state.error_message && (
          <div role="alert">{authentication_state.error_message}</div>
        )}
        <button type="submit" disabled={isDisabled}>
          {isLoading ? 'Signing in...' : 'Sign in to your account'}
        </button>
      </form>
      {authentication_state.authentication_status.is_authenticated && (
        <div>Successfully signed in!</div>
      )}
    </div>
  )
}

export default UV_SignIn
