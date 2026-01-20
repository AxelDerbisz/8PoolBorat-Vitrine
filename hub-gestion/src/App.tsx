import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import MyReservations from './pages/MyReservations';
import ReportIncident from './pages/ReportIncident';
import Profile from './pages/Profile';
import AdminReservations from './pages/AdminReservations';
import AdminStats from './pages/AdminStats';
import AdminCodes from './pages/AdminCodes';
import AdminMembers from './pages/AdminMembers';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <Reservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reservations"
              element={
                <ProtectedRoute>
                  <MyReservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signalement"
              element={
                <ProtectedRoute>
                  <ReportIncident />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/reservations"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminReservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/codes"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCodes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/membres"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminMembers />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
