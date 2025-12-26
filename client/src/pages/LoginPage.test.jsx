import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import LoginPage from './LoginPage'
import { AuthProvider } from '../contexts/AuthContext'

vi.mock('../api', () => ({
  apiFetch: vi.fn(),
  getToken: vi.fn(() => ''),
  setToken: vi.fn(),
}))

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  )
}

test('renders login form when no token', () => {
  renderPage()

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
})
