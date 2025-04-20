import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';

import petgrooming from '../assets/petgrooming.jpg';
import petboarding from '../assets/petboarding.png';
import happypets from '../assets/happypets.webp';
import animation from '../assets/animation.gif';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/product/getProduct');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productsPerPage = 4;
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  const getPaginatedProducts = () => {
    const startIndex = currentPage * productsPerPage;
    return products.slice(startIndex, startIndex + productsPerPage);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-20 bg-gray-50 p-4">
        <div className="max-w-lg text-center">
          <img 
            src={animation} 
            alt="Loading..." 
            className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-primary mb-4">Welcome to Pawtopia</h2>
          <p className="text-gray-600 mb-3 text-lg">
            Your pet's paradise is loading...
          </p>
          <p className="text-gray-500 text-base">
            We're preparing the best pet care products and services for your furry friends.
            At Pawtopia, we believe every pet deserves happiness, health, and love.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full">
                  <Link to="/services">Our Services</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="aspect-[5/3] w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={happypets}
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

            {products.length > 0 ? (
              <>
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {getPaginatedProducts().map((product) => (
                    <div key={product.productID} className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                      <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image Available
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-bold">₱{product.productPrice}</span>
                        <Button size="sm" className="rounded-full">
                        <Link to={`/products/${product.productID}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>                 
                  {products.length > productsPerPage && (
                    <div className="flex justify-between mt-8">
                      <Button 
                        variant="outline" 
                        onClick={handlePrev}
                        className="rounded-full"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center">
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`mx-1 w-8 h-8 rounded-full ${currentPage === index ? 'bg-primary text-white' : 'bg-gray-200'}`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleNext}
                        className="rounded-full"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available at the moment.</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Rest of your sections remain the same */}
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
                    src={petgrooming}
                    alt="Pet Grooming"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">Pet Grooming</h3>
                  <p className="text-gray-600 mb-4">
                    Professional grooming services to keep your pet clean, healthy, and looking their best.
                  </p>
                  <Button><Link to="/services/appointment">Book Now</Link></Button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={petboarding}
                    alt="Pet Boarding"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">Pet Boarding</h3>
                  <p className="text-gray-600 mb-4">
                    A safe and comfortable home away from home for your pets when you're away.
                  </p>
                  <Button><Link to="/services/appointment">Book Now</Link></Button>
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
      </main>
      <Footer />
    </div>
  );
}