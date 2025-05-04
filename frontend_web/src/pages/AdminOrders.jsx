import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import AdminHeader from '../components/AdminHeader';

const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Admin');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in as an admin.');
          navigate('/admin');
          return;
        }

        const response = await axios.get(`${API_BASE_URL_ORDER}/getAllOrders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data);
        setLoading(false);

        // Set username from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.username) {
          setUsername(userData.username);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin');
        } else {
          toast.error('Failed to fetch orders.');
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token); // Debug log
      const order = orders.find((o) => o.orderID === orderId);

      const updatedOrder = {
        ...order,
        orderStatus: newStatus,
        user: { userId: order.user.userId }, // Ensure user object is included
      };

      await axios.put(
        `${API_BASE_URL_ORDER}/putOrderDetails?id=${orderId}`,
        updatedOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o.orderID === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order #${orderId} updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h2>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {orders.length === 0 ? (
            <p className="text-gray-600 text-center">No orders found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderStatus}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order.orderID, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}