import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Calendar, Clock } from 'lucide-react';

export default function AppointmentPage() {
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [price, setPrice] = useState(0);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const validateForm = () => {
    let formErrors = {};
    
    if (!email) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email is invalid";
    }
    if (!contactNo) formErrors.contactNo = "Contact number is required";
    if (!service) formErrors.service = "Please select a service";
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
        const appointmentData = {
          email,
          contactNo,
          date,
          time,
          groomService: service,
          paymentMethod,
          price,
          confirmed: false,
          canceled: false
        };
        
        const response = await fetch('/appointments/postAppointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });
        
        if (response.ok) {
          setBookingSuccess(true);
          setEmail("");
          setContactNo("");
          setDate("");
          setTime("");
          setService("");
          setPaymentMethod("");
          setPrice(0);
          
          window.scrollTo(0, 0);
        } else {
          console.error('Failed to book appointment');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleServiceChange = (value) => {
    setService(value);
    // Update price based on service
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
      
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">Book an Appointment</h1>
            <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
              Schedule a service for your pet
            </p>

            <div className="mt-6">
              <Breadcrumb className="justify-center">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/services/appointment" className="font-medium">
                      Appointment
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </section>

        {bookingSuccess && (
          <div className="container mx-auto px-4 py-4 max-w-5xl">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative">
              <h3 className="font-bold">Booking Successful!</h3>
              <p>Your appointment has been submitted and is pending confirmation. We'll send a confirmation to your email shortly.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email address" 
                          className={`rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="contactNo">Contact Number</Label>
                        <Input 
                          id="contactNo" 
                          placeholder="Enter your contact number" 
                          className={`rounded-lg ${errors.contactNo ? 'border-red-500' : ''}`}
                          value={contactNo}
                          onChange={(e) => setContactNo(e.target.value)}
                        />
                        {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Service Selection</h2>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Service</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="grooming"
                              name="service"
                              value="Grooming"
                              checked={service === "Grooming"}
                              onChange={() => handleServiceChange("Grooming")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="grooming" className="font-normal">
                              Grooming - ₱500
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="boarding"
                              name="service"
                              value="Boarding"
                              checked={service === "Boarding"}
                              onChange={() => handleServiceChange("Boarding")}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="boarding" className="font-normal">
                              Boarding - ₱800
                            </Label>
                          </div>
                        </div>
                        {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                      </div>

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
                            className={`pl-10 rounded-lg ${errors.date ? 'border-red-500' : ''}`}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
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
                            className={`pl-10 rounded-lg ${errors.time ? 'border-red-500' : ''}`}
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                          />
                          {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">₱{price}</span>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full rounded-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Book Appointment'}
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        Your appointment will be pending until confirmed by our staff.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>
      </main>

      <Footer />
    </div>
  );
}