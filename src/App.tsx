import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        {/* Rute Terproteksi (Hanya bisa dibuka jika sudah login) */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/courses"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect otomatis jika akses root '/' */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Page Not Found */}
        <Route path="*" element={<div className="flex justify-center mt-20">404 - Halaman Tidak Ada</div>} />
      </Routes>
    </Router>
  );
}

export default App;