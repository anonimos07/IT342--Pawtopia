import { useParams, Link } from 'react-router-dom';
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
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch the current product
        const productResponse = await fetch(`http://localhost:8080/api/product/getProduct/${id}`);
        if (!productResponse.ok) {
          throw new Error('Product not found');
        }
        const productData = await productResponse.json();
        
        // Fetch all products for related items
        const allProductsResponse = await fetch('http://localhost:8080/api/product/getProduct');
        const allProducts = await allProductsResponse.json();
        
        // Filter out current product and get 4 random related products
        const filteredProducts = allProducts.filter(p => p.productID !== productData.productID);
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        
        setProduct(productData);
        setRelatedProducts(selected);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    setQuantity(prev => {
      if (prev >= product.quantity) {
        return prev;
      }
      return prev + 1;
    });
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      toast.error('Please login to add items to cart');
      return;
    }
  
    if (quantity < 1 || quantity > product.quantity) {
      toast.error('Invalid quantity');
      return;
    }
  
    try {
      setIsAddingToCart(true);
      
      // First, check if the user has a cart
      let cartResponse;
      try {
        cartResponse = await axios.get(
          `http://localhost:8080/api/cart/getCartById/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } catch (error) {
        // If cart doesn't exist, create one
        if (error.response && error.response.status === 404) {
          cartResponse = await axios.post(
            `http://localhost:8080/api/cart/postCartRecord`,
            { userId: userId }, // This should match your backend's expected format
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          throw error;
        }
      }
  
      const cartId = cartResponse.data.userId || userId; // Use userId as cartId based on your backend
  
      // Check if product already exists in cart
      const existingItem = cartResponse.data.cartItems?.find(
        item => item.product.productID === product.productID
      );
  
      if (existingItem) {
        // Update quantity if item exists
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
            cart: { cartId: cartId },
            product: { productID: product.productID },
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
  
      toast.success(`${quantity} ${product.productName} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const addRelatedToCart = async (relatedProduct) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      toast.error('Please login to add items to cart');
      return;
    }
  
    try {
      // First, check if the user has a cart
      let cartResponse;
      try {
        cartResponse = await axios.get(
          `http://localhost:8080/api/cart/getCartById/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } catch (error) {
        // If cart doesn't exist, create one
        if (error.response && error.response.status === 404) {
          cartResponse = await axios.post(
            `http://localhost:8080/api/cart/postCartRecord`,
            { userId: userId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          throw error;
        }
      }
  
      const cartId = cartResponse.data.userId || userId;
  
      // Check if product already exists in cart
      const existingItem = cartResponse.data.cartItems?.find(
        item => item.product.productID === relatedProduct.productID
      );
  
      if (existingItem) {
        // Update quantity if item exists
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
            cart: { cartId: cartId },
            product: { productID: relatedProduct.productID },
            lastUpdated: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
  
      toast.success(`${relatedProduct.productName} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
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