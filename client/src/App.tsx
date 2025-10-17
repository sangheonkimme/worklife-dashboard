import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthLayout } from "./components/AuthLayout";
import { PrivateRoute } from "./components/auth/PrivateRoute";

// Lazy load pages
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);
const ExpenseTrackerPage = lazy(() =>
  import("./pages/ExpenseTrackerPage").then((module) => ({
    default: module.ExpenseTrackerPage,
  }))
);
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
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

// Loading fallback component
const LoadingFallback = () => {
  return (
    <Center style={{ height: "100vh" }}>
      <Loader size="lg" />
    </Center>
  );
};

const App = () => {
  return (
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
                  <ExpenseTrackerPage />
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
            path="/profile"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProfilePage />
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
  );
};

export default App;
