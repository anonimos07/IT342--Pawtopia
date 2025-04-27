import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Filter, ChevronDown, Search } from 'lucide-react';

import animation from '../assets/animation.gif';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const API_BASE_URL_PRODUCT = import.meta.env.VITE_API_BASE_URL_PRODUCT;

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_PRODUCT}/getProduct`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected array');
        }
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setProducts([]); // Ensure it's always an array
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.productType === categoryFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.productName.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.productPrice - b.productPrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.productPrice - a.productPrice);
        break;
      case 'newest':
        // Assuming you have a createdAt field in your Product entity
        // result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // 'featured' or default sorting
        break;
    }

    setFilteredProducts(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [products, categoryFilter, searchTerm, sortOption]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Extract unique product types for filter options
  const productTypes = [...new Set(products.map(product => product.productType))];

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">Our Products</h1>
            <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
              Quality food, treats, and accessories for your beloved pets
            </p>

            <div className="mt-6">
              <Breadcrumb className="justify-center">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products" className="font-medium">
                      Products
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </section>

        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 pr-4 py-2 border rounded-full w-full md:w-[250px] focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

        
                </div>
              </div>

              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Button
                      variant={categoryFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCategoryFilter('all')}
                    >
                      All Products
                    </Button>
                    {productTypes.map((type) => (
                      <Button
                        key={type}
                        variant={categoryFilter === type ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCategoryFilter(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.productID}
                      className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md"
                    >
                      <Link to={`/products/${product.productID}`} className="block">
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
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{product.productName}</h3>
                            <span className="text-primary font-bold">₱{product.productPrice}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </Link>
                      <Button className="w-full rounded-full mt-2">
                        <Link to={`/products/${product.productID}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                  </nav>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full"
                  onClick={() => {
                    setCategoryFilter('all');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}