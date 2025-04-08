import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage="home" />

      <main className="flex-1">
  
        <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Where Pets Find <span className="text-primary">Paradise</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
                Everything your furry friend needs for a happy, healthy life - all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="rounded-full">
                  Shop Now
                </Button>
                <Button size="lg" variant="outline" className="rounded-full">
                  Our Services
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="aspect-[4/3] w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="Happy pets"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>


        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">Quality products for your beloved pets</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
     
              <div className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Dog Food"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Premium Dog Food</h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">₱450</span>
                  <Button size="sm" className="rounded-full">
                    Add to Cart
                  </Button>
                </div>
              </div>

       
              <div className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Cat Food"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Gourmet Cat Food</h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">₱400</span>
                  <Button size="sm" className="rounded-full">
                    Add to Cart
                  </Button>
                </div>
              </div>


              <div className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Cat Treats"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tasty Cat Treats</h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">₱150</span>
                  <Button size="sm" className="rounded-full">
                    Add to Cart
                  </Button>
                </div>
              </div>

          
              <div className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Dog Treats"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Crunchy Dog Treats</h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">₱180</span>
                  <Button size="sm" className="rounded-full">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>


        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
              <p className="text-gray-600 mt-2">Professional care for your furry friends</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
   
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Pet Grooming"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">Pet Grooming</h3>
                  <p className="text-gray-600 mb-4">
                    Professional grooming services to keep your pet clean, healthy, and looking their best.
                  </p>
                  <Button className="w-full rounded-full">Book Now</Button>
                </div>
              </div>

       
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Pet Boarding"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">Pet Boarding</h3>
                  <p className="text-gray-600 mb-4">
                    A safe and comfortable home away from home for your pets when you're away.
                  </p>
                  <Button className="w-full rounded-full">Book Now</Button>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Happy Pet Parents</h2>
              <p className="text-gray-600 mt-2">What our customers say about us</p>
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
                    "Pawtopia has been a lifesaver for me and my pets. The quality of their products and services is
                    unmatched!"
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