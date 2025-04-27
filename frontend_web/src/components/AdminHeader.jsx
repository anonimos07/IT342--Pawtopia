import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import adminlogin from '../assets/adminlogin.webp';


const AdminHeader = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      localStorage.removeItem('adminToken');
      localStorage.clear();
      onLogout();
      navigate('/admin');
      setIsLoggingOut(false);
    }, 2000);
  };

  return (
    <>
      {/* Loading overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
          <img 
            src={adminlogin} 
            alt="Admin Logo" 
            className="w-48 h-48 object-contain mb-4"
          />
          <div className="text-white text-xl font-semibold mb-2">Logging out...</div>
          <div className="text-gray-300">Thank you for using Pawtopia Admin</div>
          <div className="mt-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Pawtopia Admin</h1>
            <nav className="hidden md:flex space-x-6">
              <Link to="/adminProducts" className="hover:text-blue-200 transition">Inventory</Link>
              <Link to="/adminUsers" className="hover:text-blue-200 transition">Users</Link>
              <Link to="/admin/orders" className="hover:text-blue-200 transition">Orders</Link>
              <Link to="/adminAppointments" className="hover:text-blue-200 transition">Appointments</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">Welcome, {username}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;