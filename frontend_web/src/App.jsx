import { Routes, Route, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import ServicesPage from "./pages/ServicesPage"
import AppointmentPage from "./pages/AppointmentPage"
import AboutPage from "./pages/AboutPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import Header from "./components/Header"
import ProfilePage from "./pages/ProfilePage";
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from './pages/AdminUsers';
import AdminProducts from "./pages/AdminProducts"


function Layout({ children, username, role }) {
  return (
    <>
      <Header user={{ name: username, role }} />
      {children}
    </>
  )
}

function App() {
  const location = useLocation()
  const hideHeaderRoutes = ["/login", "/signup"]
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname)
  

  const username = "John Doe";  // Example username
  const role = "admin";         // Example role

  return (
    <Routes>
  
  <Route path="/admin" element={<AdminLogin />} />
<Route path="/adminDashboard" element={<AdminDashboard />} />
<Route path="/adminUsers" element={<AdminUsers />} />
<Route path="/adminProducts" element={<AdminProducts />} />

      <Route
        path="/"
        element={
          shouldHideHeader
            ? <HomePage />
            : <Layout username={username} role={role}><HomePage /></Layout>
        }
      />
      <Route
        path="/products"
        element={
          shouldHideHeader
            ? <ProductsPage />
            : <Layout username={username} role={role}><ProductsPage /></Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          shouldHideHeader
            ? <ProductDetailPage />
            : <Layout username={username} role={role}><ProductDetailPage /></Layout>
        }
      />
      <Route
        path="/services"
        element={
          shouldHideHeader
            ? <ServicesPage />
            : <Layout username={username} role={role}><ServicesPage /></Layout>
        }
      />
      <Route
        path="/services/appointment"
        element={
          shouldHideHeader
            ? <AppointmentPage />
            : <Layout username={username} role={role}><AppointmentPage /></Layout>
        }
      />
      <Route
        path="/about"
        element={
          shouldHideHeader
            ? <AboutPage />
            : <Layout username={username} role={role}><AboutPage /></Layout>
        }
      />

      <Route
        path="/profile"
        element={
          shouldHideHeader
            ? <ProfilePage />
            : <Layout username={username} role={role}><ProfilePage /></Layout>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

export default App
