import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClassroomList from './pages/ClassroomList';
import ClassroomExplorer from './pages/ClassroomExplorer';
import Reservation from './pages/Reservation';
import MyReservations from './pages/MyReservations';
import AdminClassroomManagement from './pages/AdminClassroomManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes - Student */}
            <Route
              path="/classrooms"
              element={
                <ProtectedRoute>
                  <ClassroomList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explorer"
              element={
                <ProtectedRoute>
                  <ClassroomExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reserve"
              element={
                <ProtectedRoute>
                  <Reservation />
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

            {/* Protected Routes - Admin Only */}
            <Route
              path="/admin/classrooms"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminClassroomManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

