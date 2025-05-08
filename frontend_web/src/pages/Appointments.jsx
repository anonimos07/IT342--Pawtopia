import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, PawPrint } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Footer from "../components/Footer";
import { Button } from "../components/ui/Button";

const API_BASE_URL_APPOINTMENT = import.meta.env.VITE_API_BASE_URL_APPOINTMENT;

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("googleuser"));
        const token = localStorage.getItem("token");

        console.log("Stored User:", storedUser);
        console.log("Token:", token);

        if (!token) {
          console.log("No token found, redirecting to login");
          toast.error("Please log in to view your appointments.");
          navigate("/login");
          return;
        }

        const email = storedUser?.email;

        console.log("Email:", email);

        if (!email) {
          console.log("No email found in storedUser");
          toast.error("User email not found. Please log in again.");
          navigate("/login");
          return;
        }

        const appointmentUrl = `${API_BASE_URL_APPOINTMENT}/byUserEmail/${encodeURIComponent(email)}`;
        console.log("Fetching appointments from URL:", appointmentUrl);
        const response = await axios.get(appointmentUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Appointments fetched from backend:", response.data);
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        if (error.response) {
          console.log("Response status:", error.response.status);
          console.log("Response data:", error.response.data);
          if (error.response.status === 401) {
            console.log("401 Unauthorized from appointments endpoint");
            setError("Unable to fetch appointments: Session may be invalid. Please try logging in again.");
          } else {
            setError("Failed to fetch appointments: " + (error.response.data.message || error.message));
          }
        } else {
          console.log("No response received:", error.message);
          setError("Failed to fetch appointments: " + error.message);
        }
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2 text-center">View and manage all your appointments</p>
            </div>

            {/* Appointments List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Fetching Appointments</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button asChild>
                    <Link to="/services/appointment" className="rounded-full">
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
                  <Button asChild>
                    <Link to="/services/appointment" className="rounded-full">
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.appId}
                    className="bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Background Paw Print */}
                    <div className="absolute top-0 right-0 opacity-5 -mt-6 -mr-6">
                      <PawPrint className="h-32 w-32 text-primary" />
                    </div>

                    {/* Appointment Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">
                        {new Date(appointment.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.canceled
                            ? "bg-red-100 text-red-800"
                            : appointment.confirmed
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {appointment.canceled ? "Canceled" : appointment.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{appointment.groomService || "Appointment"}</h4>
                          <p className="text-sm text-gray-500">Time: {appointment.time}</p>
                          <p className="text-sm text-gray-500">Contact: {appointment.contactNo}</p>
                          <p className="text-sm text-gray-500">Email: {appointment.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₱{appointment.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 text-right">
                      <Button asChild className="rounded-full">
                        <Link to={`/appointments/${appointment.appId}`}>View Appointment</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}