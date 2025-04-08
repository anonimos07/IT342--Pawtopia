import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Mail, Phone, PawPrint } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Charles William Sevenial",
      email: "charles@pawtopia.com",
      phone: "223-360-762",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Jared Chester Canasa",
      email: "jared@pawtopia.com",
      phone: "455-9887-273",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Vince Kyrie Seville",
      email: "vince@pawtopia.com",
      phone: "2009-40032",
      image: "/placeholder.svg?height=300&width=300",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage="about" />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">About Us</h1>
            <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">Get to know the team behind Pawtopia</p>

            <div className="mt-6">
              <Breadcrumb className="justify-center">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/about" className="font-medium">
                      About Us
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="Puppy and kitten"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    At Pawtopia, pets are family. Our mission is to provide top-quality products that make caring for
                    your pets simple and joyful.
                  </p>
                  <p>
                    From healthy food to toys and grooming essentials, we've got everything to keep your furry,
                    feathered, or scaly friends happy.
                  </p>
                  <p>
                    We believe that every pet deserves the best care possible, and we're committed to helping pet
                    parents provide that care through quality products, expert advice, and exceptional service.
                  </p>
                </div>
                <Button className="rounded-full" asChild>
                  <Link to="/services">Explore Our Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                The passionate people behind Pawtopia who work tirelessly to ensure your pets get the best
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="aspect-square">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-xl mb-2">{member.name}</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${member.email}`} className="hover:text-primary">
                          {member.email}
                        </a>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${member.phone}`} className="hover:text-primary">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                The principles that guide everything we do at Pawtopia
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-primary/5 p-8 rounded-xl">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-center">Quality</h3>
                <p className="text-gray-600 text-center">
                  We carefully select only the highest quality products that we would use for our own pets.
                </p>
              </div>

              <div className="bg-primary/5 p-8 rounded-xl">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-center">Care</h3>
                <p className="text-gray-600 text-center">
                  We treat every pet as if they were our own, with compassion, respect, and genuine care.
                </p>
              </div>

              <div className="bg-primary/5 p-8 rounded-xl">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-center">Community</h3>
                <p className="text-gray-600 text-center">
                  We're committed to building a community of pet lovers who share our passion for animal welfare.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Join Our Pack</h2>
              <p className="text-gray-600 mt-2">
                Subscribe to get updates on new products, special offers, and pet care tips
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="rounded-full">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}