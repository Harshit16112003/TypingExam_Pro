import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import TypingTest from "./pages/TypingTest";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Payment from "./pages/Payment";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminContent from "./pages/admin/AdminContent";

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* User Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <LandingPage />
                </Layout>
              }
            />
            <Route
              path="/tests"
              element={
                <Layout>
                  <TypingTest />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/subscription"
              element={
                <Layout>
                  <Subscription />
                </Layout>
              }
            />
            <Route
              path="/payment"
              element={
                <Layout>
                  <Payment />
                </Layout>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <Layout>
                  <Leaderboard />
                </Layout>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminPayments />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminContent />
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
