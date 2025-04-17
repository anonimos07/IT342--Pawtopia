import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = ({ username, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.clear();
    onLogout();
    navigate('/admin');
  };

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold">Pawtopia Admin</h1>
          <nav className="hidden md:flex space-x-6">
            <Link to="/adminProducts" className="hover:text-blue-200 transition">Inventory</Link>
            <Link to="/adminUsers" className="hover:text-blue-200 transition">Users</Link>
            <Link to="/admin/appointments" className="hover:text-blue-200 transition">Appointments</Link>
            <Link to="/admin/orders" className="hover:text-blue-200 transition">Orders</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">Welcome, {username}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;