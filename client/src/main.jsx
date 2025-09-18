import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function LoginPage() { return <h1>Login Page</h1> }
function RegisterPage() { return <h1>Register Page</h1> }
function TodosPage() { return <h1>Todos Page</h1> }

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/todos" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/todos" element={<TodosPage />} />
      <Route path="*" element={<Navigate to="/todos" replace />} />
    </Routes>
  </BrowserRouter>
)
