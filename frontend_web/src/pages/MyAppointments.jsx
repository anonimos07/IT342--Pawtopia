import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
const API_BASE_URL_USER_APPOINTMENT = import.meta.env.VITE_API_BASE_URL_APPOINTMENT;

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user email and token from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || {});
  const userEmail = userData.logemail;  // Get email from user object
  const token = localStorage.getItem('token');

  
  
  // Create Axios instance with auth header
  const api = axios.create({
    baseURL: `${API_BASE_URL_USER_APPOINTMENT}`,
    headers: {
      'Authorization': `Bearer ${token}` 
    }
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        console.log('Fetching appointments for:', userEmail);
        
        const response = await api.get(`/byUserEmail/${userEmail}`);
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('API Error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        setError(err.response?.data?.message || 'Failed to fetch appointments');
        setLoading(false);
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };

    if (userEmail && token) {
      fetchAppointments();
    } else {
      console.log('Missing data:', {
        hasEmail: !!userEmail,
        hasToken: !!token
      });
      setError('Please login to view appointments');
      setLoading(false);
    }
  }, [userEmail, token]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadgeClass = (canceled, confirmed) => {
    if (canceled) return 'bg-red-100 text-red-800';
    if (confirmed) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (canceled, confirmed) => {
    if (canceled) return 'CANCELLED';
    if (confirmed) return 'CONFIRMED';
    return 'PENDING';
  };

  // const cancelAppointment = async (appId) => {
  //   if (window.confirm('Are you sure you want to cancel this appointment?')) {
  //     try {
  //       await api.put(`/appointments/${appId}/cancel`);
        
  //       // Update local state
  //       setAppointments(appointments.map(apt => 
  //         apt.appId === appId ? { ...apt, canceled: true } : apt
  //       ));
  //     } catch (err) {
  //       alert(err.response?.data?.message || 'Failed to cancel appointment');
  //       console.error('Error:', err);
        
  //       if (err.response?.status === 401) {
  //         window.location.href = '/login';
  //       }
  //     }
  //   }
  // };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h1>
          
          {appointments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You don't have any appointments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Service</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Date</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Time</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Price</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                    {/* <th className="py-3 px-4 text-left text-gray-700 font-semibold">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.appId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{appointment.groomService || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-800">{formatDate(appointment.date)}</td>
                      <td className="py-3 px-4 text-gray-800">{formatTime(appointment.time)}</td>
                      <td className="py-3 px-4 text-gray-800">₱{appointment.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          getStatusBadgeClass(appointment.canceled, appointment.confirmed)
                        }`}>
                          {getStatusText(appointment.canceled, appointment.confirmed)}
                        </span>
                      </td>
                      {/* <td className="py-3 px-4">
                        {!appointment.canceled && (
                          <button
                            onClick={() => cancelAppointment(appointment.appId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;