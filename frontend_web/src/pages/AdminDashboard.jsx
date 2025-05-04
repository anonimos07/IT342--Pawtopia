import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side navigation
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;

const AdminDashboard = () => {
  const [username, setUsername] = useState('Admin');
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    inventory: 0,
    appointments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No admin token found');
          return;
        }

        // Fetch orders
        const ordersResponse = await axios.get(`${API_BASE_URL_ORDER}/getAllOrders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Simulate other stats (replace with actual API calls if available)
        setStats({
          users: 1243, // Replace with actual API call if available
          orders: ordersResponse.data.length,
          inventory: 89, // Replace with actual API call if available
          appointments: 42, // Replace with actual API call if available
        });

        // Optionally set username from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.username) {
          setUsername(userData.username);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Admin logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols學2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Inventory Items" 
            value={stats.inventory} 
            icon="📊" 
            color="bg-purple-100 text-purple-800"
          />
          <DashboardCard 
            title="Total Users" 
            value={stats.users} 
            icon="👥" 
            color="bg-blue-100 text-blue-800"
          />
          <DashboardCard 
            title="Recent Orders" 
            value={stats.orders} 
            icon="📦" 
            color="bg-green-100 text-green-800"
          />
          <DashboardCard 
            title="Appointments" 
            value={stats.appointments} 
            icon="📅" 
            color="bg-yellow-100 text-yellow-800"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton 
              label="Add Product" 
              path="/adminProducts"
              icon="➕"
            />
            <ActionButton 
              label="View Users" 
              path="/adminUsers" 
              icon="👥"
            />
            <ActionButton 
              label="Process Orders" 
              path="/adminOrders" // Fixed path to match route in App.jsx
              icon="📦"
            />
            <ActionButton 
              label="Schedule" 
              path="/adminAppointments" 
              icon="📅"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-6 rounded-lg shadow`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

// Reusable Action Button Component
const ActionButton = ({ label, path, icon }) => (
  <Link 
    to={path} // Use Link instead of <a> for client-side navigation
    className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition"
  >
    <span className="text-2xl block mb-2">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default AdminDashboard;