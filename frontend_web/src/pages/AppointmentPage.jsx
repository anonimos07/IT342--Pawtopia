import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Calendar, Clock } from 'lucide-react';

export default function AppointmentPage() {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [instructions, setInstructions] = useState("");
  const [serviceType, setServiceType] = useState("grooming");
  const [servicePackage, setServicePackage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);


  const validateForm = () => {
    let formErrors = {};
    
    if (!fullName) formErrors.fullName = "Full name is required";
    if (!email) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email is invalid";
    }
    if (!phone) formErrors.phone = "Contact number is required";
    if (!petName) formErrors.petName = "Pet name is required";
    if (!petType) formErrors.petType = "Pet type is required";
    if (!servicePackage) formErrors.servicePackage = "Please select a package";
    if (!date) formErrors.date = "Date is required";
    if (!time) formErrors.time = "Time is required";
    
    return formErrors;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    

    const formErrors = validateForm();
    setErrors(formErrors);
    
   
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
 
      setTimeout(() => {
        setBookingSuccess(true);
        setIsSubmitting(false);
        
n
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 500);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage="services" />

      <main className="flex-1">

        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">Book an Appointment</h1>
            <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
              Schedule a grooming or boarding service for your pet
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
              <p>Your appointment has been booked. We'll send a confirmation to your email shortly.</p>
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
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          placeholder="Enter your full name" 
                          className={`rounded-lg ${errors.fullName ? 'border-red-500' : ''}`}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>

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
                        <Label htmlFor="phone">Contact Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="Enter your contact number" 
                          className={`rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Pet Information</h2>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="petName">Pet Name</Label>
                        <Input 
                          id="petName" 
                          placeholder="Enter your pet's name" 
                          className={`rounded-lg ${errors.petName ? 'border-red-500' : ''}`}
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                        />
                        {errors.petName && <p className="text-red-500 text-xs mt-1">{errors.petName}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="petType">Pet Type</Label>
                        <Select 
                          value={petType} 
                          onValueChange={setPetType}
                        >
                          <SelectTrigger className={`rounded-lg ${errors.petType ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select pet type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dog">Dog</SelectItem>
                            <SelectItem value="cat">Cat</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.petType && <p className="text-red-500 text-xs mt-1">{errors.petType}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="breed">Breed</Label>
                        <Input 
                          id="breed" 
                          placeholder="Enter your pet's breed" 
                          className="rounded-lg"
                          value={breed}
                          onChange={(e) => setBreed(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                          id="age" 
                          placeholder="Enter your pet's age" 
                          className="rounded-lg"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Special Instructions</Label>
                        <Textarea 
                          placeholder="Any special needs or instructions for your pet" 
                          className="rounded-lg"
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Service Selection</h2>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Service Type</Label>
                        <RadioGroup 
                          defaultValue="grooming"
                          value={serviceType}
                          onValueChange={setServiceType}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="grooming" id="grooming" />
                            <Label htmlFor="grooming">Pet Grooming</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="boarding" id="boarding" />
                            <Label htmlFor="boarding">Pet Boarding</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid gap-2">
                        <Label>Service Package</Label>
                        <Select
                          value={servicePackage}
                          onValueChange={setServicePackage}
                        >
                          <SelectTrigger className={`rounded-lg ${errors.servicePackage ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Grooming - ₱500</SelectItem>
                            <SelectItem value="premium">Premium Grooming - ₱800</SelectItem>
                            <SelectItem value="deluxe">Deluxe Spa Package - ₱1200</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.servicePackage && <p className="text-red-500 text-xs mt-1">{errors.servicePackage}</p>}
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
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Service Fee:</span>
                        <span>₱800</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">₱800</span>
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

      <Footer />
    </div>
  );
}