import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Calendar, Clock, X } from 'lucide-react';

export default function AppointmentPage() {
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const validateForm = () => {
    let formErrors = {};
    
    if (!email) formErrors.email = "Email is required";
    if (!contactNo) formErrors.contactNo = "Contact number is required";
    if (!service) formErrors.service = "Please select a service";
    if (!price) formErrors.price = "Please select a price";
    if (!paymentMethod) formErrors.paymentMethod = "Please select a payment method";
    if (!date) formErrors.date = "Date is required";
    if (!time) formErrors.time = "Time is required";
    
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error("You need to be logged in to book an appointment");
        }
        const appointmentData = {
          email,
          contactNo,
          date,
          time,
          groomService: service,
          paymentMethod,
          price,
          confirmed: false,
          canceled: false,
        };
        
        const response = await fetch('http://localhost:8080/appointments/postAppointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(appointmentData),
          credentials: 'include'
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          setBookingSuccess(true);
          // Reset form
          setEmail("");
          setContactNo("");
          setDate("");
          setTime("");
          setService("");
          setPaymentMethod("");
          setPrice(0);
        } else {
          console.error('Failed to book appointment:', responseData.message);
          alert(responseData.message || 'Failed to book appointment');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };  

  const handleServiceChange = (value) => {
    setService(value);
    switch(value) {
      case 'Grooming':
        setPrice(500);
        break;
      case 'Boarding':
        setPrice(800);
        break;
      default:
        setPrice(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Booking Confirmed!</h3>
              <button 
                onClick={() => setBookingSuccess(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p>Your appointment has been successfully booked.</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Service:</p>
                  <p className="font-medium">{service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date:</p>
                  <p className="font-medium">{date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time:</p>
                  <p className="font-medium">{time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total:</p>
                  <p className="font-medium">₱{price}</p>
                </div>
              </div>
              <Button 
                onClick={() => setBookingSuccess(false)}
                className="w-full mt-4 rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <form onSubmit={handleSubmit}>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                
                {/* Personal Information Column */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contactNo">Contact Number</Label>
                        <Input 
                          id="contactNo" 
                          value={contactNo}
                          onChange={(e) => setContactNo(e.target.value)}
                          className={`rounded-lg ${errors.contactNo ? 'border-red-500' : ''}`}
                        />
                        {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Selection Column */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Service Selection</h2>
                    <div className="space-y-6">
                      
                      {/* Service Options */}
                      <div className="grid gap-2">
                        <Label>Service Type</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="grooming"
                              name="service"
                              value="Grooming"
                              checked={service === "Grooming"}
                              onChange={() => setService("Grooming")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="grooming" className="font-normal">
                              Grooming
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="boarding"
                              name="service"
                              value="Boarding"
                              checked={service === "Boarding"}
                              onChange={() => setService("Boarding")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="boarding" className="font-normal">
                              Boarding
                            </Label>
                          </div>
                        </div>
                        {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                      </div>

                      {/* Price Options */}
                      <div className="grid gap-2">
                        <Label>Price</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="price500"
                              name="price"
                              value="500"
                              checked={price === "500"}
                              onChange={() => setPrice("500")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="price500" className="font-normal">
                              ₱500
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="price1000"
                              name="price"
                              value="1000"
                              checked={price === "1000"}
                              onChange={() => setPrice("1000")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="price1000" className="font-normal">
                              ₱1000
                            </Label>
                          </div>
                        </div>
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                      </div>

                      {/* Payment Method */}
                      <div className="grid gap-2">
                        <Label>Payment Method</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="gcash"
                              name="paymentMethod"
                              value="GCash"
                              checked={paymentMethod === "GCash"}
                              onChange={() => setPaymentMethod("GCash")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="gcash" className="font-normal">
                              GCash
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="counter"
                              name="paymentMethod"
                              value="Over the Counter"
                              checked={paymentMethod === "Over the Counter"}
                              onChange={() => setPaymentMethod("Over the Counter")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="counter" className="font-normal">
                              Over the Counter
                            </Label>
                          </div>
                        </div>
                        {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Appointment Details</h2>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            id="date" 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`pl-10 rounded-lg ${errors.date ? 'border-red-500' : ''}`}
                          />
                          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Time</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            id="time" 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className={`pl-10 rounded-lg ${errors.time ? 'border-red-500' : ''}`}
                          />
                          {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary and Submit */}
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">₱{price || 0}</span>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full rounded-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Book Appointment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}