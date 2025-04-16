import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Minus, Plus, Star } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  
  const product = {
    id: 1,
    name: "Premium Dog Food",
    category: "Dog Food",
    price: 450,
    image: "/placeholder.svg?height=500&width=500",
    description:
      "Premium dog food made with high-quality ingredients, providing balanced nutrition for dogs of all sizes and breeds. Supports healthy digestion, promotes a shiny coat, and sustains energy for an active lifestyle. Free from artificial colors, flavors, and preservatives.",
    about:
      "This dog food is carefully formulated to meet the highest standards of pet nutrition. Made with real meat, wholesome grains, and natural ingredients, it ensures optimal nutrition. Suitable for puppies, adults, and senior dogs, with formulas designed to support health at every life stage.",
    ratings: {
      average: 5,
      count: 12,
      reviews: [
        {
          id: 1,
          author: "Emily R.",
          rating: 5,
          comment:
            "My dog loves this food! Noticed a visible improvement, he has more energy and no more stomach issues. Great product, highly recommend!",
        },
        {
          id: 2,
          author: "Mark T.",
          rating: 5,
          comment:
            "Best dog food I've ever bought! My picky eater devours it every time, and I've noticed a big improvement in his coat. Definitely sticking with this brand!",
        },
      ],
    },
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1">
     
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/products/${product.id}`} className="font-medium">
                    {product.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

     
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-gray-500">{product.category}</p>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">({product.ratings.count} reviews)</span>
                </div>

                <div className="text-3xl font-bold text-primary">₱{product.price}</div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-full">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleDecrement}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleIncrement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button className="rounded-full flex-1">Add to Cart</Button>
                </div>

                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="p-4 text-gray-600">
                    <p>{product.description}</p>
                  </TabsContent>
                  <TabsContent value="about" className="p-4 text-gray-600">
                    <p>{product.about}</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

       
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>

            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold text-lg">5 out of 5</h3>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.ratings.count} reviews)</span>
              </div>
            </div>

            <div className="space-y-6">
              {product.ratings.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">— {review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

       
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                  <Link to={`/products/${i + 2}`} className="block">
                    <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg?height=300&width=300"
                        alt="Related Product"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">Related Product {i + 1}</h3>
                          <p className="text-sm text-gray-500">Pet Food</p>
                        </div>
                        <span className="text-primary font-bold">₱350</span>
                      </div>
                    </div>
                  </Link>
                  <Button className="w-full rounded-full mt-2">Add to Cart</Button>
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