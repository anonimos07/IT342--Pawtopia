import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PawPrint } from "lucide-react"
import axios from "axios"
import Footer from "../components/Footer"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [address, setAddress] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    streetBuildingHouseNo: ''
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login"); // Redirect to login if no token
          return;
        }
      
        // Fetch current user's data
        const response = await axios.get("http://localhost:8080/users/me", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          withCredentials: true // Include this if using cookies
        });
        
        const userData = response.data;
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
            `http://localhost:8080/adresses/get-users/${userData.userId}`,
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
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token"); // Clear invalid token
          navigate("/login"); // Redirect to login
        }
        setError(err.response?.data?.message || "Failed to fetch user data");
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
        `http://localhost:8080/users/user/${user.userId}/address`,
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
    } catch (err) {
      console.error("Error updating address:", err);
      setError(err.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Profile Header */}
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

          {/* Profile Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* User Information */}
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

              {/* Address Section */}
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}