import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import * as api from '../api'

vi.mock('../api', () => ({
  apiFetch: vi.fn(),
  getToken: vi.fn(() => ''),
  setToken: vi.fn(),
}))

function Harness() {
  const { login, user } = useAuth()

  return (
    <div>
      <button onClick={() => login('x@y.com', 'abc12345')}>Login</button>
      <span data-testid="user-email">{user?.email ?? ''}</span>
    </div>
  )
}

test('login stores token and sets user', async () => {
  api.apiFetch.mockImplementation((path, opts = {}) => {
    if (path === '/api/auth/login' && opts.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ token: 'token-123', user: { email: 'x@y.com' } }),
      })
    }
    return Promise.resolve({ ok: false, status: 401, json: async () => ({}) })
  })

  render(
    <AuthProvider>
      <Harness />
    </AuthProvider>
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /login/i }))

  await waitFor(() => {
    expect(screen.getByTestId('user-email')).toHaveTextContent('x@y.com')
  })
  expect(api.setToken).toHaveBeenCalledWith('token-123')
})
