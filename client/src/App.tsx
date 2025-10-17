import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { AuthLayout } from './components/AuthLayout'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage'
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

        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/expense"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ExpenseTrackerPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
