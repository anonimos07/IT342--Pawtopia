import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Appointment from "./components/Appointment";
import AboutUs from "./components/AboutUs";
import Profile from "./components/Profile";
import Checkout from "./components/Checkout";
import { Navigate } from "react-router-dom";
import UserAppointmentList from "./components/UserAppointmentList";
import AdminLogin from "./components/AdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminDashboard from "./components/AdminDashboard";
import AdminHeader from "./components/AdminHeader";
import AdminFooter from "./components/AdminFooter";
import { AdminAuthProvider } from "./components/AdminAuthProvider";
import AdminAppointmentList from "./components/AdminAppointmentList";
import Inventory from "./components/Inventory";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import RateProduct from "./components/RateProduct";
import OrderList from "./components/Orders";
import OrderDetails from "./components/OrderDetails";
import { AuthProvider } from "./components/AuthProvider";

function Layout({ children, username, role }) {
  return (
    <>
      <Header username={username} role={role} />
      {children}
      <Footer />
    </>
  );
}

function AdminLayout({ children, username, role }) {
  return (
    <>
      <AdminHeader username={username} role={role} />
      {children}
    </>
  );
}

function App() {
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout username={username} role={role}>
                <HomePage />
              </Layout>
            }
          />
          <Route path="/auth" element={<Auth setUsername={setUsername} setRole={setRole} />} />
          <Route
            path="/cart"
            element={
              <Layout username={username} role={role}>
                <Cart />
              </Layout>
            }
          />
          <Route
            path="/appointments"
            element={
              localStorage.getItem("username") ? (
                <Layout username={username} role={role}>
                  <Appointment />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/aboutus"
            element={
              <Layout username={username} role={role}>
                <AboutUs />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout username={username} role={role}>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/checkout"
            element={
              <Layout username={username} role={role}>
                <Checkout />
              </Layout>
            }
          />
          <Route
            path="/appointmentslist"
            element={
              <Layout username={username} role={role}>
                <UserAppointmentList />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout username={username} role={role}>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/MyPurchases"
            element={
              <Layout username={username} role={role}>
                <OrderList />
              </Layout>
            }
          />
          <Route
            path="/MyPurchases/:orderID"
            element={
              <Layout username={username} role={role}>
                <OrderDetails />
              </Layout>
            }
          />

          <Route
            path="/productdetails/:productId"
            element={
              <Layout username={username} role={role}>
                <ProductDetail />
              </Layout>
            }
          />

          <Route
            path="/rate-product/:productId"
            element={
              <Layout username={username} role={role}>
                <RateProduct />
              </Layout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminAppointmentList />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Inventory />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
