import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Monitor = lazy(() => import('./pages/Monitor'));
const CostDashboard = lazy(() => import('./pages/CostDashboard'));

function PageLoader() {
  return (
    <div className="ds-page flex items-center justify-center text-ore-text-tertiary text-ore-body">
      Loading…
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    setAuthenticated(!!localStorage.getItem('authToken'));
  }, []);

  if (authenticated === null) return <PageLoader />;
  return authenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/monitor" element={<Navigate to="/monitoring" replace />} />
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <Monitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/costs"
            element={
              <ProtectedRoute>
                <CostDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
