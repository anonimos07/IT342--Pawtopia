import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('googleuser'));
  const userId = user?.id || user?.userId;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !token) {
      toast.error('Please log in to view your profile');
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch orders
        const ordersResponse = await axios.get(
          `http://localhost:8080/api/order/getAllOrdersByUserId?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Orders response:', ordersResponse.data);
        setOrders(ordersResponse.data);

        // Fetch appointments (hypothetical endpoint)
        const appointmentsResponse = await axios.get(
          `http://localhost:8080/api/appointments/get-appointments?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Appointments response:', appointmentsResponse.data);
        setAppointments(appointmentsResponse.data.filter(app => !app.canceled && new Date(app.date) >= new Date()));
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
        toast.error(err.response?.data?.message || 'Failed to load data');
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-medium text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        {/* Recent Orders Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.orderID} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Order #{order.orderID}</p>
                      <p className="text-gray-600">Date: {order.orderDate}</p>
                      <p className="text-gray-600">Items: {order.orderItems?.length || 0}</p>
                      <p className="text-gray-600">Status: {order.orderStatus}</p>
                    </div>
                    <p className="font-semibold">₱{order.totalPrice?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Link to={`/orders/${order.orderID}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent orders found.</p>
          )}
        </section>

        {/* Upcoming Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
          {appointments.length > 0 ? (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.appId}
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.groomService}</p>
                      <p className="text-gray-600">
                        Date: {new Date(appointment.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">Time: {appointment.time}</p>
                      <p className="text-gray-600">
                        Status: {appointment.confirmed ? 'Confirmed' : 'Pending'}
                      </p>
                    </div>
                    <p className="font-semibold">₱{appointment.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Link to={`/appointments/${appointment.appId}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments found.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}