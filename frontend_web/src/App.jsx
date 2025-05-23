import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ServicesPage from "./pages/ServicesPage";
import AppointmentPage from "./pages/AppointmentPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import ProfilePage from "./pages/ProfilePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from './pages/AdminUsers';
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import CartPage from "./pages/CartPage";
import AdminAppointments from "./pages/AdminAppointments";
import OrderDetails from "./pages/OrderDetails";
import CheckoutPage from "./pages/CheckoutPage";
import Orders from "./pages/Orders";
import Appointments from "./pages/Appointments";
import OAuthSuccess from "./pages/OAuthSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyAppointments from "./pages/MyAppointments";

// Protected route component to handle authentication
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin route component to handle admin authentication
function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = userData.role === 'admin';

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

// Layout component to handle header and user state
function Layout({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      setUser(userData);
    } else {
      setUser(null);
    }
    
    // Listen for login/logout events
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (token) {
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleStorageChange);
    };
  }, []);

  return (
    <>
      <Header user={user} />
      {children}
    </>
  );
}

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/signup", "/admin", "/oauth-success"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);
  
  // Auth state listener
  useEffect(() => {
    const handleLogin = () => {
      console.log("Login event detected");
    };
    
    window.addEventListener('loginSuccess', handleLogin);
    return () => {
      window.removeEventListener('loginSuccess', handleLogin);
    };
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/admin" element={<AdminLogin />} />
      
      {/* Admin routes */}
      <Route path="/adminDashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/adminUsers" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/adminProducts" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/adminOrders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/adminAppointments" element={<AdminRoute><AdminAppointments /></AdminRoute>} />

      {/* Public or authenticated routes with layout */}
      <Route 
        path="/" 
        element={
          shouldHideHeader ? (
            <HomePage />
          ) : (
            <Layout>
              <HomePage />
            </Layout>
          )
        } 
      />

      <Route
        path="/products"
        element={
          shouldHideHeader ? (
            <ProductsPage />
          ) : (
            <Layout>
              <ProductsPage />
            </Layout>
          )
        }
      />

      <Route
        path="/products/:id"
        element={
          shouldHideHeader ? (
            <ProductDetailPage />
          ) : (
            <Layout>
              <ProductDetailPage />
            </Layout>
          )
        }
      />

      <Route
        path="/services"
        element={
          shouldHideHeader ? (
            <ServicesPage />
          ) : (
            <Layout>
              <ServicesPage />
            </Layout>
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/services/appointment"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <AppointmentPage />
            ) : (
              <Layout>
                <AppointmentPage />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <ProfilePage />
            ) : (
              <Layout>
                <ProfilePage />
            </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment-success"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <PaymentSuccess />
            ) : (
              <Layout>
                <PaymentSuccess />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/Mypurchases"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <Orders />
            ) : (
              <Layout>
                <Orders />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/Mypurchases/:OrderID"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <OrderDetails />
            ) : (
              <Layout>
                <OrderDetails />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/MyAppointments"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? (
              <MyAppointments />
            ) : (
              <Layout>
                <MyAppointments />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          shouldHideHeader ? (
            <AboutPage />
          ) : (
            <Layout>
              <AboutPage />
            </Layout>
          )
        }
      />

      <Route
        path="/cart"
        element={
          shouldHideHeader ? (
            <CartPage />
          ) : (
            <Layout>
              <CartPage />
            </Layout>
          )
        }
      />

      <Route
        path="/orderDetails"
        element={
          shouldHideHeader ? (
            <OrderDetails />
          ) : (
            <Layout>
              <OrderDetails />
            </Layout>
          )
        }
      />

      <Route
        path="/checkout"
        element={
          shouldHideHeader ? (
            <CheckoutPage />
          ) : (
            <Layout>
              <CheckoutPage />
            </Layout>
          )
        }
      />
    </Routes>
  );
}

export default App;