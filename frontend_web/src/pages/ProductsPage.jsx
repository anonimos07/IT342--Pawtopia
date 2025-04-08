import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Filter, ChevronDown, Search } from 'lucide-react';

export default function ProductsPage() {

  const products = [
    {
      id: 1,
      name: "Premium Dog Food",
      category: "Dog Food",
      price: 450,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Gourmet Cat Food",
      category: "Cat Food",
      price: 400,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Tasty Cat Treats",
      category: "Cat Treats",
      price: 150,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      name: "Crunchy Dog Treats",
      category: "Dog Treats",
      price: 180,
      image: "/placeholder.svg?height=300&width=300",
    },
    { id: 5, name: "Puppy Dry Food", category: "Dog Food", price: 500, image: "/placeholder.svg?height=300&width=300" },
    {
      id: 6,
      name: "Senior Cat Food",
      category: "Cat Food",
      price: 450,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 7,
      name: "Dental Cat Treats",
      category: "Cat Treats",
      price: 200,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 8,
      name: "Training Dog Treats",
      category: "Dog Treats",
      price: 250,
      image: "/placeholder.svg?height=300&width=300",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage="products" />

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="dog-food">Dog Food</SelectItem>
                    <SelectItem value="cat-food">Cat Food</SelectItem>
                    <SelectItem value="dog-treats">Dog Treats</SelectItem>
                    <SelectItem value="cat-treats">Cat Treats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border rounded-full w-full md:w-[250px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

     
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <span className="text-primary font-bold">₱{product.price}</span>
                      </div>
                    </div>
                  </Link>
                  <Button className="w-full rounded-full mt-2">Add to Cart</Button>
                </div>
              ))}
            </div>

         
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  1
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-primary text-white">
                  2
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  3
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  4
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </nav>
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