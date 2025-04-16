import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
  const [username, setUsername] = useState('Admin');
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    inventory: 0,
    appointments: 0
  });

  // Simulate fetching data
  useEffect(() => {
    // In a real app, you would fetch these from your API
    setTimeout(() => {
      setStats({
        users: 1243,
        orders: 567,
        inventory: 89,
        appointments: 42
      });
    }, 500);
  }, []);

  const handleLogout = () => {
    // Additional logout logic can go here
    console.log('Admin logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="Inventory Items" 
            value={stats.inventory} 
            icon="📊" 
            color="bg-purple-100 text-purple-800"
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
              path="/admin/orders" 
              icon="📦"
            />
            <ActionButton 
              label="Schedule" 
              path="/admin/appointments" 
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
  <a 
    href={path} 
    className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition"
  >
    <span className="text-2xl block mb-2">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export default AdminDashboard;