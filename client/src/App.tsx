import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { AuthLayout } from './components/AuthLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
