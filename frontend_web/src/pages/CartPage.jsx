import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Trash2, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

export default function CartPage() {
  const [authChecked, setAuthChecked] = useState(false);  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const fetchCartItems = async () => {
    try {
      if (!userId || !token) {
        navigate('/login');
        return;
      }
  
      // First get the user's cart
      const cartResponse = await axios.get(
        `http://localhost:8080/api/cart/getCartById/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      // If cart exists but has no items
      if (!cartResponse.data.cartItems || cartResponse.data.cartItems.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
  
      // Map the cart items to our frontend structure
      const items = cartResponse.data.cartItems.map(item => ({
        cartItemId: item.cartItemId,
        quantity: item.quantity,
        lastUpdated: item.lastUpdated,
        product: {
          productID: item.product.productID,
          productName: item.product.productName,
          productPrice: item.product.productPrice,
          productType: item.product.productType,
          productImage: item.product.productImage,
          quantity: item.product.quantity,
          description: item.product.description
        }
      }));
  
      // Adjust quantities if they exceed available stock
      const updatedCartItems = await Promise.all(items.map(async (item) => {
        if (item.quantity > item.product.quantity) {
          try {
            await axios.put(
              `http://localhost:8080/api/cartItem/systemUpdateCartItem/${item.cartItemId}`,
              { 
                quantity: item.product.quantity,
                lastUpdated: new Date().toISOString()
              },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return { ...item, quantity: item.product.quantity };
          } catch (error) {
            console.error('Error updating cart item quantity:', error);
            return item;
          }
        }
        return item;
      }));
  
      // Sort by lastUpdated (newest first)
      const sortedItems = updatedCartItems.sort((a, b) => 
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
  
      setCartItems(sortedItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      toast.error('Failed to load your cart');
      if (err.response?.status === 401) {
        navigate('/login');
      }
      if (err.response?.status === 404) {
        // Cart doesn't exist yet - create an empty one
        try {
          await axios.post(
            `http://localhost:8080/api/cart/postCartRecord`,
            { userId: userId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setCartItems([]);
        } catch (createErr) {
          console.error('Error creating cart:', createErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      
      if (!currentUserId || !currentToken) {
        navigate('/login');
      } else {
        setAuthChecked(true);
        fetchCartItems();
      }
    };

    checkAuth();
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;  
  
    try {
      await axios.put(
        `http://localhost:8080/api/cartItem/updateCartItem/${itemId}`,
        { 
          quantity: newQuantity,
          lastUpdated: new Date().toISOString()
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.cartItemId === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      toast.success('Quantity updated');
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemToDelete(itemId);
    setOpenDialog(true);
  };

  const confirmRemoveItem = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/cartItem/deleteCartItem/${itemToDelete}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.cartItemId !== itemToDelete);
        
        // If cart is now empty, we might want to handle that case
        if (updatedItems.length === 0) {
          // Optionally: You could delete the cart here if your backend supports it
        }
        
        return updatedItems;
      });
      
      // Also remove from selected items if it was selected
      setSelectedItems(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(itemToDelete);
        return newSelection;
      });
      
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setOpenDialog(false);
      setItemToDelete(null);
    }
  };

  const handleCheckChange = (itemId, isChecked) => {
    const newSelection = new Set(selectedItems);
    if (isChecked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const calculateTotals = () => {
    const subtotal = Array.from(selectedItems).reduce((total, itemId) => {
      const item = cartItems.find(i => i.cartItemId == itemId);
      return total + (item?.product.productPrice * item?.quantity || 0);
    }, 0);

    const shipping = subtotal > 0 ? 30 : 0;
    const total = subtotal + shipping;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to checkout');
      return;
    }
  
    try {
      // Check if user has address by getting user details
      const userRes = await axios.get(
        `http://localhost:8080/users/user/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!userRes.data?.address) {
        toast.error('Please add a shipping address first');
        navigate('/profile');
        return;
      }
  
      // Prepare checkout data
      const { subtotal, shipping, total } = calculateTotals();
      const selectedProducts = cartItems
        .filter(item => selectedItems.has(item.cartItemId))
        .map(item => ({
          cartItemId: item.cartItemId,
          quantity: item.quantity,
          product: {
            productID: item.product.productID,
            productName: item.product.productName,
            productPrice: item.product.productPrice,
            productImage: item.product.productImage
          }
        }));
  
      navigate('/checkout', {
        state: {
          items: selectedProducts,
          summary: { subtotal, shipping, total }
        }
      });
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error(err.response?.data?.message || 'Failed to proceed to checkout');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-center p-4">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotals();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold ml-4">Your Shopping Cart</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border divide-y">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="p-4 flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.cartItemId)}
                        onChange={(e) => handleCheckChange(item.cartItemId, e.target.checked)}
                        className="mr-4 h-5 w-5 mt-4"
                      />
                      
                      <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border">
                        <img
                          src={item.product.productImage || '/placeholder.svg'}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <Link to={`/products/${item.product.productID}`}>
                              <h3 className="text-lg font-medium text-gray-900 hover:text-primary">
                                {item.product.productName}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500">
                              {item.product.productType}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.product.quantity > 0 ? (
                                <span className="text-green-600">In Stock ({item.product.quantity} available)</span>
                              ) : (
                                <span className="text-red-600">Out of Stock</span>
                              )}
                            </p>
                          </div>
                          <p className="text-lg font-medium text-gray-900">
                            ₱{(item.product.productPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex-1 flex items-end justify-between mt-2">
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                              disabled={item.quantity >= item.product.quantity}
                            >
                              +
                            </Button>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(item.cartItemId)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({selectedItems.size} items)</span>
                      <span className="font-medium">₱{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₱{shipping}</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-lg font-bold">₱{total}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6 rounded-full"
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="mt-4 text-sm text-gray-500">
                    {selectedItems.size === 0 && (
                      <p className="text-center">Select items to proceed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Removal</h3>
            <p className="mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRemoveItem}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}