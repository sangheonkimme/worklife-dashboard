import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthLayout } from "./components/AuthLayout";
import { PrivateRoute } from "./components/auth/PrivateRoute";

// Lazy load pages
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const SalaryCalculatorPage = lazy(() =>
  import("./pages/SalaryCalculatorPage").then((module) => ({
    default: module.SalaryCalculatorPage,
  }))
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((module) => ({
    default: module.SignupPage,
  }))
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
const NotesPage = lazy(() => import("./pages/NotesPage"));
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);
const FinancialCalculatorPage = lazy(() =>
  import("./pages/FinancialCalculatorPage").then((module) => ({
    default: module.FinancialCalculatorPage,
  }))
);

// Loading fallback component
const LoadingFallback = () => {
  return (
    <Center style={{ height: "100vh" }}>
      <Loader size="lg" />
    </Center>
  );
};

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
                    <TransactionsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <TransactionsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SalaryCalculatorPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/finance-tools"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <FinancialCalculatorPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <NotesPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
