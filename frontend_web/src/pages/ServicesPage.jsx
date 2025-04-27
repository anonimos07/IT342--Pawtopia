import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Scissors, Home, PawPrint } from 'lucide-react';

import petgrooming from '../assets/petgrooming.jpg';
import petboarding from '../assets/petboarding.png';

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      name: "Pet Grooming",
      description: "Professional grooming services to keep your pet clean, healthy, and looking their best.",
      features: [
        "Bath and blow dry",
        "Haircut and styling",
        "Nail trimming",
        "Ear cleaning",
        "Teeth brushing",
        "Specialized skin treatments",
      ],
      price: "From ₱500",
      image: petgrooming,
      icon: Scissors,
    },
    {
      id: 2,
      name: "Pet Boarding",
      description: "A safe and comfortable home away from home for your pets when you're away.",
      features: [
        "24/7 supervision",
        "Climate-controlled facilities",
        "Individual spaces",
        "Regular feeding and exercise",
        "Medication administration",
        "Daily updates and photos",
      ],
      price: "From ₱800/night",
      image: petboarding,
      icon: Home,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1">
    
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">Our Services</h1>
            <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">Professional care for your furry friends</p>

            <div className="mt-6">
              <Breadcrumb className="justify-center">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/services" className="font-medium">
                      Services
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </section>

     
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">A happy pet is always clean and well-cared for!</h2>
              <p className="text-gray-600 mb-8">
                Your furry friends deserve top-notch grooming and a safe place to stay. At Pawtopia, we offer both pet
                grooming and boarding to ensure they get the best care. Our professional team is dedicated to making
                your pet's experience comfortable and enjoyable.
              </p>
              <div className="flex justify-center">
                <Button className="rounded-full" asChild>
                  <Link to="/services/appointment">Book an Appointment</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

   
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <service.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{service.name}</CardTitle>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <PawPrint className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <p className="font-bold text-primary">{service.price}</p>
                    <Button className="rounded-full" asChild>
                      <Link to="/services/appointment">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

 
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What Pet Parents Say</h2>
              <p className="text-gray-600 mt-2">Hear from our satisfied customers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "The grooming service at Pawtopia is exceptional! My dog always comes back looking and smelling
                    amazing. The staff is so gentle and caring with him."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="font-medium">Happy Customer {i}</p>
                      <p className="text-sm text-gray-500">Pet Parent</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

    
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Ready to Book a Service?</h2>
              <p className="text-gray-600 mt-2 mb-6">Schedule an appointment for your pet today</p>
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/services/appointment">Book an Appointment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}