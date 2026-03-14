import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import History from './pages/History';
import Settings from './pages/Settings';
import Warehouse from './pages/Warehouse';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Operations from './pages/Operations';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    // Check local session
    const checkSession = () => {
      let sessionStr = localStorage.getItem('core_inventory_session');
      if (!sessionStr) {
         sessionStr = sessionStorage.getItem('core_inventory_session');
      }

      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (new Date(session.expires).getTime() > Date.now()) {
            login(session.user);
          } else {
            // Expired
            localStorage.removeItem('core_inventory_session');
            sessionStorage.removeItem('core_inventory_session');
            logout();
          }
        } catch (e) {
           console.error("Invalid session format");
        }
      }
    };
    
    checkSession();
  }, [login, logout]);

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={true} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored" 
      />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Dashboard Routes (Protected) */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="operations" element={<Operations />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="history" element={<History />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}
