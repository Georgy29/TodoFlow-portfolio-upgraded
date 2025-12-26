import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import * as api from '../api'
import TodosPage from './TodosPage'
import { AuthProvider } from '../contexts/AuthContext'

vi.mock('../api', () => ({
  apiFetch: vi.fn(),
  getToken: vi.fn(() => ''),
  setToken: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <TodosPage />
      </MemoryRouter>
    </AuthProvider>
  )
}

test('loads todos and supports toggle/delete', async () => {
  const todo = { id: 1, title: 'Write tests', done: false }

  api.apiFetch.mockImplementation((path, opts = {}) => {
    if (path === '/api/todos' && (!opts.method || opts.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: async () => [todo],
      })
    }
    if (path === '/api/todos/1' && opts.method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...todo, done: true }),
      })
    }
    if (path === '/api/todos/1' && opts.method === 'DELETE') {
      return Promise.resolve({ ok: true })
    }
    return Promise.resolve({ ok: false, status: 500, json: async () => ({}) })
  })

  renderPage()

  expect(await screen.findByText('Write tests')).toBeInTheDocument()

  const user = userEvent.setup()
  await user.click(screen.getByRole('checkbox'))

  await waitFor(() => {
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  await user.click(screen.getByRole('button', { name: /delete/i }))

  await waitFor(() => {
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument()
  })
  expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
})
