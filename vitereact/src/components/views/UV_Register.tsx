import React, { useState } from 'react'
import { useAppStore } from '@/store/main'

const UV_Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register, authentication_state } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const isLoading = authentication_state.authentication_status.is_loading
  const isDisabled = isLoading || !email || !password

  return (
    <div>
      <h1>Register</h1>
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      {authentication_state.authentication_status.is_authenticated && (
        <div>Successfully registered!</div>
      )}
    </div>
  )
}

export default UV_Register
