import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Minus, Plus, Star, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the current product
        const productResponse = await axios.get(
          `http://localhost:8080/api/product/getProduct/${id}`
        );
        
        // Fetch all products for related items
        const allProductsResponse = await axios.get(
          'http://localhost:8080/api/product/getProduct'
        );
        
        // Filter out current product and get 4 random related products
        const filteredProducts = allProductsResponse.data.filter(
          p => p.productID !== productResponse.data.productID
        );
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        
        setProduct(productResponse.data);
        setRelatedProducts(selected);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    setQuantity(prev => {
      if (prev >= product.quantity) {
        toast.info(`Maximum available quantity is ${product.quantity}`);
        return prev;
      }
      return prev + 1;
    });
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const addToCart = async () => {
    // Add safety checks for localStorage parsing
    let token, user;
    try {
      token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      if (!userString) throw new Error('No user data');
      user = JSON.parse(userString);
      if (!user?.id) throw new Error('Invalid user data');
    } catch (error) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
  
    try {
      setIsAddingToCart(true);
      
      // 1. Get user's cart (or create if doesn't exist)
      let cart;
      try {
        const cartResponse = await axios.get(
          `http://localhost:8080/api/cart/getCartById/${user.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        cart = cartResponse.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // Cart doesn't exist - create one
          const createResponse = await axios.post(
            `http://localhost:8080/api/cart/postCartRecord`,
            { userId: user.userId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          cart = createResponse.data;
        } else {
          throw error;
        }
      }

      // 2. Check if product already exists in cart
      const existingItem = cart.cartItems?.find(
        item => item.product.productID === product.productID
      );

      if (existingItem) {
        // Update existing item quantity
        await axios.put(
          `http://localhost:8080/api/cartItem/updateCartItem/${existingItem.cartItemId}`,
          { 
            quantity: existingItem.quantity + quantity,
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Add new item to cart
        await axios.post(
          `http://localhost:8080/api/cartItem/postCartItem`,
          {
            quantity: quantity,
            product: { productID: product.productID },
            cart: { cartId: cart.cartId || cart.userId },
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }

      toast.success(`${quantity} ${product.productName} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Failed to add to cart';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Please login to add items to cart';
          navigate('/login');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const addRelatedToCart = async (relatedProduct) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
  
    try {
      // 1. Get user's cart (or create if doesn't exist)
      let cart;
      try {
        const cartResponse = await axios.get(
          `http://localhost:8080/api/cart/getCartById/${user.userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        cart = cartResponse.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // Cart doesn't exist - create one
          const createResponse = await axios.post(
            `http://localhost:8080/api/cart/postCartRecord`,
            { userId: user.userId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          cart = createResponse.data;
        } else {
          throw error;
        }
      }

      // 2. Check if product already exists in cart
      const existingItem = cart.cartItems?.find(
        item => item.product.productID === relatedProduct.productID
      );

      if (existingItem) {
        // Update existing item quantity
        await axios.put(
          `http://localhost:8080/api/cartItem/updateCartItem/${existingItem.cartItemId}`,
          { 
            quantity: existingItem.quantity + 1,
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Add new item to cart
        await axios.post(
          `http://localhost:8080/api/cartItem/postCartItem`,
          {
            quantity: 1,
            product: { productID: relatedProduct.productID },
            cart: { cartId: cart.cartId || cart.userId },
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }

      toast.success(`${relatedProduct.productName} added to your cart`);
    } catch (error) {
      console.error('Error adding related product to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-medium text-red-600 mb-4">Error Loading Product</h2>
          <p className="mb-6">{error}</p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-medium mb-4">Product Not Found</h2>
          <p className="mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = product.productreview && product.productreview.length > 0 
    ? product.productreview.reduce((acc, review) => acc + review.rating, 0) / product.productreview.length
    : 0;

  const isIncrementDisabled = quantity >= product.quantity;

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
                  <BreadcrumbLink href={`/products/${product.productID}`} className="font-medium">
                    {product.productName}
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
                    src={product.productImage || "/placeholder.svg"}
                    alt={product.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>
                  <p className="text-gray-500">{product.productType}</p>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.productreview ? product.productreview.length : 0} reviews)
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary">₱{product.productPrice}</div>

                <div className="flex items-center gap-4">
          {product.quantity > 0 ? (
            <>
              <div className="flex items-center border rounded-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={handleIncrement}
                  disabled={isIncrementDisabled}
                  aria-label="Increase quantity"
                >
                  <Plus className={`h-4 w-4 ${isIncrementDisabled ? 'text-gray-400' : 'text-current'}`} />
                </Button>
              </div>
              <Button 
                className="rounded-full flex-1 gap-2" 
                onClick={addToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                Add to Cart
              </Button>
              {isIncrementDisabled && (
                <span className="text-sm text-gray-500">Maximum quantity reached</span>
              )}
            </>
          ) : (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
              Out of Stock
            </div>
          )}
        </div>


                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="about">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="p-4 text-gray-600">
                    <p>{product.description}</p>
                  </TabsContent>
                  <TabsContent value="about" className="p-4 text-gray-600">
                    <div className="space-y-2">
                      <p><strong>Type:</strong> {product.productType}</p>
                      <p><strong>Available Quantity:</strong> {product.quantity}</p>
                    </div>
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
                <h3 className="font-bold text-lg">{averageRating.toFixed(1)} out of 5</h3>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.productreview ? product.productreview.length : 0} reviews)
                </span>
              </div>
            </div>

            {product.productreview && product.productreview.length > 0 ? (
              <div className="space-y-6">
                {product.productreview.map((review) => (
                  <div key={review.reviewID} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">— {review.user ? review.user.username : 'Anonymous'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-500">
                No reviews yet for this product.
              </div>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.productID} className="bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
                  <Link to={`/products/${relatedProduct.productID}`} className="block mb-4">
                    <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={relatedProduct.productImage || "/placeholder.svg?height=300&width=300"}
                        alt={relatedProduct.productName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{relatedProduct.productName}</h3>
                          <p className="text-sm text-gray-500">{relatedProduct.productType}</p>
                        </div>
                        <span className="text-primary font-bold">₱{relatedProduct.productPrice}</span>
                      </div>
                    </div>
                  </Link>
                  <Button 
                    className="w-full rounded-full gap-2" 
                    onClick={() => addRelatedToCart(relatedProduct)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
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