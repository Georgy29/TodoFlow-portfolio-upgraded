import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import LoadingSpinner from './components/LoadingSpinner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TodosPage from './pages/TodosPage'

// Export for fast refresh
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner label="Checking session..." />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/todos"
          element={
            <PrivateRoute>
              <TodosPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/todos" replace />} />
      </Routes>
    </BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { fontFamily: 'system-ui, sans-serif' },
      }}
    />
  </AuthProvider>
)
