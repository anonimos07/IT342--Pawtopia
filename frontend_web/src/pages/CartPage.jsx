import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Trash2, ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL_USER_CART = import.meta.env.VITE_API_BASE_URL_CART;
const API_BASE_URL_USER_CART_ITEM = import.meta.env.VITE_API_BASE_URL_CART_ITEM;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_USER;
const API_BASE_URL_ADDRESS = import.meta.env.VITE_API_BASE_URL_ADDRESS;
const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;
const API_BASE_URL_PAYMENT = import.meta.env.VITE_API_BASE_URL_PAYMENT;

export default function CartPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showAddressAlert, setShowAddressAlert] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('googleuser'));
  const userId = user?.id || user?.userId;
  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId || !token) {
        navigate('/login');
        return;
      }

      const cartResponse = await axios.get(
        `${API_BASE_URL_USER_CART}/getCartById/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!cartResponse.data?.cartItems?.length) {
        setCartItems([]);
        return;
      }

      const processedItems = await Promise.all(
        cartResponse.data.cartItems.map(async item => {
          const product = item.product;
          const availableQuantity = product.quantity;
          const currentQuantity = item.quantity;

          if (currentQuantity > availableQuantity) {
            try {
              await axios.put(
                `${API_BASE_URL_USER_CART_ITEM}/systemUpdateCartItem/${item.cartItemId}`,
                {
                  quantity: availableQuantity,
                  lastUpdated: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                ...item,
                quantity: availableQuantity,
                product: { ...product, quantity: availableQuantity }
              };
            } catch (updateError) {
              console.error('Failed to adjust quantity:', updateError);
              return item;
            }
          }
          return item;
        })
      );

      const sortedItems = processedItems.sort((a, b) =>
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );

      setCartItems(sortedItems);
    } catch (err) {
      console.error('Cart fetch error:', err);

      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (err.response?.status === 404) {
        try {
          await axios.post(
            `${API_BASE_URL_USER_CART}/postCartRecord`,
            { userId: userId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCartItems([]);
          return;
        } catch (createError) {
          console.error('Cart creation failed:', createError);
          setError('Failed to initialize your cart');
          toast.error('Could not set up your shopping cart');
          return;
        }
      }

      setError(err.response?.data?.message || 'Failed to load cart');
      toast.error('Could not load your shopping cart');
    } finally {
      setLoading(false);
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    if (!userId || !token) {
      navigate('/login');
      return;
    }

    setAuthChecked(true);
    fetchCartItems();
  }, [userId, token, navigate, fetchCartItems]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const item = cartItems.find(i => i.cartItemId === itemId);
      if (!item) return;

      if (newQuantity > item.product.quantity) {
        toast.error(`Only ${item.product.quantity} available in stock`);
        return;
      }

      await axios.put(
        `${API_BASE_URL_USER_CART_ITEM}/updateCartItem/${itemId}`,
        {
          quantity: newQuantity,
          lastUpdated: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(prev => prev.map(item =>
        item.cartItemId === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (err) {
      console.error('Quantity update failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (itemId) => {
    setItemToDelete(itemId);
    setOpenDialog(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) {
      setOpenDialog(false);
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL_USER_CART_ITEM}/deleteCartItem/${itemToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(prev => prev.filter(item => item.cartItemId !== itemToDelete));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemToDelete);
        return newSet;
      });

      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Item removal failed:', err);
      toast.error(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setOpenDialog(false);
      setItemToDelete(null);
    }
  };

  const handleCheckChange = (itemId, isChecked) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(itemId) : newSet.delete(itemId);
      return newSet;
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalItems = 0;

    selectedItems.forEach(itemId => {
      const item = cartItems.find(i => i.cartItemId == itemId);
      if (item) {
        subtotal += item.product.productPrice * item.quantity;
        totalItems += item.quantity;
      }
    });

    const shipping = subtotal > 0 ? 30 : 0;
    const total = subtotal + shipping;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      totalItems
    };
  };

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to checkout');
      return;
    }

    try {
      const userRes = await axios.get(`${API_BASE_URL_ADDRESS}/get-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Full user data:', userRes.data);
      const userData = userRes.data;

      // Check for required address fields
      const requiredFields = ['region', 'province', 'city', 'barangay', 'postalCode'];
      const missingFields = requiredFields.filter(field => !userData?.[field] || userData[field].toString().trim() === '');
      const hasValidAddress = missingFields.length === 0;

      console.log('Missing address fields:', missingFields);
      console.log('Has valid address:', hasValidAddress);

      if (!hasValidAddress) {
        setShowAddressAlert(true);
        return;
      }

      const outOfStockItems = cartItems.filter(item =>
        selectedItems.has(item.cartItemId) && item.quantity > item.product.quantity
      );

      if (outOfStockItems.length > 0) {
        toast.error('Some items are out of stock. Please update your cart.');
        await fetchCartItems();
        return;
      }

      const { subtotal, shipping, total, totalItems } = calculateTotals();
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cartItemId));

      navigate('/checkout', {
        state: {
          selectedItems: selectedCartItems,
          orderSummary: { subtotal, shipping, total, totalItems }
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);

      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Checkout failed');
      }
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-medium text-red-600 mb-4">Error Loading Cart</h2>
            <p className="mb-6">{error}</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { subtotal, shipping, total, totalItems } = calculateTotals();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
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
                  {cartItems.map((item) => {
                    const isOutOfStock = item.product.quantity <= 0;
                    const isSelected = selectedItems.has(item.cartItemId);

                    return (
                      <div
                        key={item.cartItemId}
                        className={`p-4 flex items-start ${isOutOfStock ? 'opacity-70' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => !isOutOfStock && handleCheckChange(item.cartItemId, e.target.checked)}
                          disabled={isOutOfStock}
                          className={`mr-4 h-5 w-5 mt-4 ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                              <Link
                                to={`/products/${item.product.productID}`}
                                className="hover:text-primary"
                              >
                                <h3 className="text-lg font-medium text-gray-900">
                                  {item.product.productName}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500">
                                {item.product.productType}
                              </p>
                              <p className={`text-sm mt-1 ${
                                isOutOfStock ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {isOutOfStock
                                  ? 'Out of Stock'
                                  : `In Stock (${item.product.quantity} available)`}
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
                                disabled={item.quantity <= 1 || isOutOfStock}
                              >
                                -
                              </Button>
                              <span className="mx-2 w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                                disabled={item.quantity >= item.product.quantity || isOutOfStock}
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
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
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

                  {selectedItems.size === 0 && (
                    <p className="mt-3 text-sm text-center text-gray-500">
                      Select items to proceed
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Removal</h3>
            <p className="mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRemoveItem}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddressAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">No Address Found</h3>
            <p className="mb-6">No address found. Please fill up address in the profile page.</p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowAddressAlert(false)}
              >
                Close
              </Button>
              <Button
                asChild
                onClick={() => setShowAddressAlert(false)}
              >
                <Link to="/profile">Go to Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}