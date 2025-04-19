import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Trash2, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('token');

  const fetchCartItems = async () => {
    try {
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/cart/getCartById/${userId}`);
      
      // Adjust quantities if they exceed available stock
      const updatedCartItems = response.data.cartItems.map(item => {
        if (item.quantity > item.product.quantity) {
          axios.put(`http://localhost:8080/api/cartItem/systemUpdateCartItem/${item.cartItemId}`, {
            quantity: item.product.quantity
          });
          return { ...item, quantity: item.product.quantity };
        }
        return item;
      });

      // Sort by lastUpdated (newest first)
      const sortedItems = updatedCartItems.sort((a, b) => 
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );

      setCartItems(sortedItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [userId, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(`http://localhost:8080/api/cartItem/updateCartItem/${itemId}`, {
        quantity: newQuantity
      });

      setCartItems(prevItems => 
        prevItems.map(item => 
          item.cartItemId === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemToDelete(itemId);
    setOpenDialog(true);
  };

  const confirmRemoveItem = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/cartItem/deleteCartItem/${itemToDelete}`);
      setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== itemToDelete));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setOpenDialog(false);
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
      // Check if user has address
      const userRes = await axios.get(`http://localhost:8080/auth/user/findById/${userId}`);
      if (!userRes.data?.address) {
        toast.error('Please add a shipping address first');
        navigate('/profile');
        return;
      }

      // Prepare checkout data
      const { subtotal, shipping, total } = calculateTotals();
      const selectedProducts = cartItems.filter(item => selectedItems.has(item.cartItemId));

      navigate('/checkout', {
        state: {
          items: selectedProducts,
          summary: { subtotal, shipping, total }
        }
      });
    } catch (err) {
      toast.error('Failed to proceed to checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div>Loading your cart...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotals();

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage="cart" />
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
                    <div key={item.cartItemId} className="p-4 flex">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.cartItemId)}
                        onChange={(e) => handleCheckChange(item.cartItemId, e.target.checked)}
                        className="mr-4 h-5 w-5"
                      />
                      
                      <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border">
                        <img
                          src={item.product.productImage || '/placeholder.svg'}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.product.productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.product.productType}
                            </p>
                          </div>
                          <p className="text-lg font-medium text-gray-900">
                            ₱{(item.product.productPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex-1 flex items-end justify-between">
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
                <div className="bg-white rounded-lg shadow-sm border p-6">
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