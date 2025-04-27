import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/Button";
import { toast } from 'sonner';

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const PaymentMethodSelector = () => {
    return (
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Select Payment Method</p>
        <div className="flex space-x-4">
          <div 
            className={`p-3 border rounded-md cursor-pointer ${paymentMethod === "Cash on Delivery" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onClick={() => setPaymentMethod("Cash on Delivery")}
          >
            <p className="font-medium">Cash on Delivery</p>
          </div>
          <div 
            className={`p-3 border rounded-md cursor-pointer ${paymentMethod === "GCash" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onClick={() => setPaymentMethod("GCash")}
          >
            <p className="font-medium">GCash</p>
          </div>
        </div>
      </div>
    );
  };

  const { selectedItems, orderSummary } = location.state || {
    selectedItems: [],
    orderSummary: {},
  };

  const clearState = () => {
    navigate(location.pathname, { state: { selectedItems: [], orderSummary: {} } });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("googleuser"));
        const userId = storedUser?.id || storedUser?.userId;

        if (!userId || !token) {
          console.error("Missing userId or token:", { userId, token });
          toast.error("Please log in to proceed.");
          navigate("/login");
          return;
        }
        if (selectedItems.length === 0) {
          toast.error("No items selected for checkout.");
          navigate("/cart");
          return;
        }

        const response = await axios.get(`http://localhost:8080/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);

        const addressResponse = await axios.get(`http://localhost:8080/adresses/get-users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!addressResponse.data || !addressResponse.data.region) {
          toast.error("Please complete your address in your profile.");
          navigate("/profile", { state: { fromCheckout: true } });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load user data.");
        }
      }
    };
    fetchUserData();
  }, [navigate, selectedItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("googleuser"));
    const userId = storedUser?.id || storedUser?.userId;
    const username = storedUser?.username || storedUser?.logemail;

    console.log("Submitting order with:", { userId, username, token, selectedItems });

    // Validation checks
    if (!token || !userId || !username) {
        console.error("Missing required data for order:", { token, userId, username });
        toast.error("Please log in to proceed.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
    }

    if (selectedItems.length === 0) {
        toast.error("No items to order.");
        navigate("/cart");
        return;
    }

    // Prepare order data
    const orderItems = selectedItems.map((item) => ({
        orderItemName: item.product.productName,
        orderItemImage: item.product.productImage || "/placeholder.svg?height=100&width=100",
        price: item.product.productPrice,
        quantity: item.quantity,
        productId: item.product.productID.toString(),
    }));

    const orderDate = new Date().toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
    });

    const orderData = {
        orderItems,
        orderDate,
        orderStatus: "To Receive",
        paymentMethod: paymentMethod,
        paymentStatus: "PENDING",
        totalPrice: orderSummary.total,
        user: { userId, username },
    };

    try {
        // Step 1: Create the order
        const response = await axios.post(
            "http://localhost:8080/api/order/postOrderRecord",
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Order creation response:", response.data);

        if (response.status !== 200) {
            throw new Error("Failed to create order");
        }

        // Step 2: Remove items from cart
        try {
            await Promise.all(
                selectedItems.map((item) =>
                    axios.delete(`http://localhost:8080/api/cartItem/deleteCartItem/${item.cartItemId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );
            console.log("Cart items removed successfully");
        } catch (cartError) {
            console.error("Error removing cart items:", cartError);
            // Continue despite cart cleanup error since order was created
        }

        toast.success("Order successfully placed!");
        clearState();

        // Step 3: Handle payment based on method
        if (paymentMethod === "GCash") {
            try {
                const orderId = response.data.id || response.data.orderID;
                console.log("Creating payment link for order:", orderId);

                const paymentResponse = await axios.post(
                  `http://localhost:8080/api/payment/create-payment`,
                  {
                    totalPrice: orderSummary.total,
                    description: "A Great Way to Spend Money to your Pets!",
                    remarks: "Shop Again!"
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                window.location.href = paymentResponse.data.checkoutUrl;
                console.log("Payment link response:", paymentResponse.data);

                if (paymentResponse.data?.success || paymentResponse.data?.paymentLink) {
                  localStorage.setItem('pendingPaymentOrder', JSON.stringify({
                    orderId,
                    referenceNumber: paymentResponse.data.referenceNumber,
                    timestamp: new Date().getTime()
                }));
                  
                return;
                } else {
                    throw new Error(paymentResponse.data?.error || "Payment link creation failed");
                }
            } catch (paymentError) {
                console.error("Payment initiation error details:", {
                    status: paymentError.response?.status,
                    data: paymentError.response?.data,
                    message: paymentError.message
                });

                const errorMessage = paymentError.response?.data?.message || 
                                    paymentError.message || 
                                    "Payment initiation failed. Your order is saved but unpaid.";
                
                toast.error(errorMessage);
                navigate("/MyPurchases", { state: { orders: response.data } });
            }
        } else {
            // For non-GCash methods
            navigate("/MyPurchases", { state: { orders: response.data } });
        }

    } catch (error) {
        console.error("Order processing error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
        } else if (error.response?.status === 403) {
            toast.error("Unauthorized: User data mismatch. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
        } else {
            toast.error("Order processing failed: " + 
                (error.response?.data?.message || error.message || "Unknown error"));
        }
    }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-2 text-center">
                Complete your purchase by reviewing your order and confirming your details.
              </p>
            </div>
            <div className="mb-6">
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
            <div className="grid md:grid-cols-7 gap-8">
              <div className="md:col-span-4">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product.productImage || "/placeholder.svg?height=100&width=100"}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.productName}</h3>
                          <p className="text-sm text-gray-500">
                            ₱{item.product.productPrice} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₱{(item.product.productPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-6 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₱{orderSummary.subtotal}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping Fee</span>
                      <span className="font-medium">₱{orderSummary.shippingFee}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-primary">₱{orderSummary.total}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Billing & Shipping Details</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <p className="text-sm text-gray-500 mb-1">Full Name</p>
    <p className="font-medium">
      {user.firstName} {user.lastName}
    </p>
  </div>
  <div>
    <p className="text-sm text-gray-500 mb-1">Email</p>
    <p className="font-medium">{user.email}</p>
  </div>
  <div>
    <p className="text-sm text-gray-500 mb-1">Address</p>
    <p className="font-medium">
      {user.address?.streetBuildingHouseNo} {user.address?.barangay}, {user.address?.city} City,
      Region {user.address?.region}, {user.address?.postalCode}
    </p>
  </div>
  
  {/* Payment Method Selector */}
  <div>
    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
    <div className="flex space-x-3 mt-1">
      <div 
        onClick={() => setPaymentMethod("Cash on Delivery")}
        className={`border px-4 py-2 rounded-md cursor-pointer transition ${
          paymentMethod === "Cash on Delivery" 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <p className="font-medium">Cash on Delivery</p>
      </div>
      <div 
        onClick={() => setPaymentMethod("GCash")}
        className={`border px-4 py-2 rounded-md cursor-pointer transition ${
          paymentMethod === "GCash" 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <p className="font-medium">GCash</p>
      </div>
    </div>
  </div>
  
  <Button type="submit" className="w-full rounded-full mt-4">
    Place Order
  </Button>
</form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;