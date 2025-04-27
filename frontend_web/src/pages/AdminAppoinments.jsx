import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL_ADMIN_APPOINTMENT = import.meta.env.VITE_API_BASE_URL_APPOINTMENT;

const AdminAppointments = () => {
  const [username, setUsername] = useState('Admin');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL_ADMIN_APPOINTMENT}/getAppointment`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAppointments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL_ADMIN_APPOINTMENT}/confirm/${appId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setAppointments(appointments.map(app => 
          app.appId === appId ? { ...app, confirmed: true } : app
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (appId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL_ADMIN_APPOINTMENT}/cancel/${appId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setAppointments(appointments.map(app => 
          app.appId === appId ? { ...app, canceled: true } : app
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel appointment');
    }
  };

  const handleDelete = async (appId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this appointment? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${API_BASE_URL_ADMIN_APPOINTMENT}/deleteAppointment/${appId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setAppointments(appointments.filter(app => app.appId !== appId));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete appointment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Assuming time is in HH:mm format
  };

  const handleLogout = () => {
    // Additional logout logic can go here
    console.log('Admin logged out');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-6xl animate-pulse mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-700">Loading Pawtopia Appointments...</h2>
        <p className="text-gray-500 mt-2">Checking the schedule for furry friends!</p>
      </div>
    </div>
  );

  if (error) return <div>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
          <button 
            onClick={() => navigate('/adminDashboard')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.appId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.appId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.contactNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(appointment.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(appointment.time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.groomService}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${appointment.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.canceled ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Canceled
                      </span>
                    ) : appointment.confirmed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {!appointment.canceled && !appointment.confirmed && (
                        <>
                          <button
                            onClick={() => handleConfirm(appointment.appId)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.appId)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(appointment.appId)}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminAppointments;