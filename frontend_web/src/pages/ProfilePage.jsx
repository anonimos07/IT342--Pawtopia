import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Package, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Footer from "../components/Footer";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_USER;
const API_BASE_URL_ADDRESS = import.meta.env.VITE_API_BASE_URL_ADDRESS;
const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;
const API_BASE_URL_APPOINTMENT = import.meta.env.VITE_API_BASE_URL_APPOINTMENT;

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    streetBuildingHouseNo: ''
  });
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        
        if (!token) {
          toast.error("Please log in to access your profile.");
          navigate("/login");
          return;
        }
      
        // Fetch current user's data
        const userResponse = await axios.get(`${API_BASE_URL}/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        const userData = userResponse.data;
        console.log("User data:", userData);
        setUser({
          userId: userData.userId,
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'CUSTOMER'
        });

        // Fetch address if user exists
        if (userData.userId) {
          const addressResponse = await axios.get(
            `${API_BASE_URL_ADDRESS}/get-users/${userData.userId}`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (addressResponse.data) {
            setAddress({
              region: addressResponse.data.region || '',
              province: addressResponse.data.province || '',
              city: addressResponse.data.city || '',
              barangay: addressResponse.data.barangay || '',
              postalCode: addressResponse.data.postalCode || '',
              streetBuildingHouseNo: addressResponse.data.streetBuildingHouseNo || ''
            });
          }

          // Fetch recent orders
          try {
            console.log(`Fetching orders for userId: ${userData.userId}`);
            const ordersResponse = await axios.get(
              `${API_BASE_URL_ORDER}/getAllOrdersByUserId/${userData.userId}`,
              {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );
            console.log("Orders response:", ordersResponse.data);
            const sortedOrders = ordersResponse.data
              .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
              .slice(0, 3);
            setOrders(sortedOrders);
          } catch (orderError) {
            console.error("Error fetching orders:", orderError.response?.data || orderError.message);
            if (orderError.response?.status === 401) {
              console.error("401 Error details:", orderError.response);
              toast.error("Unauthorized access to orders. Please verify your session or contact support.");
              // Delay logout to allow debugging
              setTimeout(() => {
                localStorage.removeItem("token");
                navigate("/login");
              }, 5000); // 5-second delay
            } else {
              toast.error("Failed to fetch orders. Please try again later.");
            }
            setOrders([]);
          }

          // Fetch upcoming appointments using email
          try {
            console.log(`Fetching appointments for email: ${userData.email}`);
            const appointmentsResponse = await axios.get(
              `${API_BASE_URL_APPOINTMENT}/byUserEmail/${encodeURIComponent(userData.email)}`,
              {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );
            console.log("Appointments response:", appointmentsResponse.data);
            const today = new Date("2025-05-07");
            const upcomingAppointments = appointmentsResponse.data
              .filter(appointment => new Date(appointment.date) >= today)
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            setAppointments(upcomingAppointments);
          } catch (appointmentError) {
            console.error("Error fetching appointments:", appointmentError.response?.data || appointmentError.message);
            if (appointmentError.response?.status === 401) {
              console.error("401 Error details:", appointmentError.response);
              toast.error("Unauthorized access to appointments. Please verify your session or contact support.");
              // Delay logout to allow debugging
              setTimeout(() => {
                localStorage.removeItem("token");
                navigate("/login");
              }, 5000); // 5-second delay
            } else {
              toast.error("Failed to fetch appointments. Please try again later.");
            }
            setAppointments([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          console.error("401 Error details:", err.response);
          toast.error("Session expired or unauthorized. Please log in again.");
          // Delay logout to allow debugging
          setTimeout(() => {
            localStorage.removeItem("token");
            navigate("/login");
          }, 5000); // 5-second delay
        } else {
          setError(err.response?.data?.message || "Please Add Account Information for you to be able to Order.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${API_BASE_URL}/user/${user.userId}/address`,
        address,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      setError(null);
      setIsEditMode(false);
      toast.success("Address updated successfully!");
    } catch (err) {
      console.error("Error updating address:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to update address");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <PawPrint className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Please log in</h1>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="bg-primary/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-3xl font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">Role: {user.role}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="text-primary hover:text-primary-dark"
                >
                  {isEditMode ? 'Cancel' : 'Edit Address'}
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Username</h3>
                  <p className="mt-1">{user.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{user.email}</p>
                </div>
                {user.firstName && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                    <p className="mt-1">{user.firstName}</p>
                  </div>
                )}
                {user.lastName && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                    <p className="mt-1">{user.lastName}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Region</label>
                    <input
                      type="text"
                      name="region"
                      value={address.region}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Province</label>
                    <input
                      type="text"
                      name="province"
                      value={address.province}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Barangay</label>
                    <input
                      type="text"
                      name="barangay"
                      value={address.barangay}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Street/Building/House No.</label>
                    <input
                      type="text"
                      name="streetBuildingHouseNo"
                      value={address.streetBuildingHouseNo}
                      onChange={handleAddressChange}
                      disabled={!isEditMode}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {isEditMode && (
                  <button
                    onClick={handleSaveAddress}
                    disabled={loading}
                    className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:bg-primary/50"
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                )}
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <div className="space-x-4">
                      <Link
                        to="/MyPurchases"
                        className="inline-block bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/products"
                        className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-gray-300"
                      >
                        Browse Products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    {orders.map(order => (
                      <div key={order.orderID} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order.orderID}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ₱{order.totalPrice.toFixed(2)}
                            </p>
                            <Link
                              to={`/MyPurchases/${order.orderID}`}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center mt-4">
                      <Link
                        to="/MyPurchases"
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View All Orders
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
                {appointments.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                    <p className="text-gray-600 mb-4">You don't have any upcoming appointments.</p>
                    <Link
                      to="/services/appointment"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90"
                    >
                      Book Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    {appointments.map(appointment => (
                      <div key={appointment.appId} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.groomService || "Appointment"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric"
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <Link
                              to={`/appointments/${appointment.appId}`}
                              className="text-primary hover:text-primary-dark text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center mt-4">
                      <Link
                        to="/appointments"
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View All Appointments
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}