import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';
import { toast } from 'sonner';
const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;

export default function OrderDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state?.order) {
      navigate('/cart');
      return;
    }

    setOrder(state.order);
    setLoading(false);
  }, [state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-medium text-red-600 mb-4">Order Not Found</h2>
            <p className="mb-6">We couldn't process your order. Please try again.</p>
            <Button asChild>
              <Link to="/cart">Back to Cart</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold ml-4">Order Confirmation</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Order #{order.orderID}</h2>
                <p className="text-sm text-gray-600">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Status: {order.orderStatus}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your order is being processed. We'll notify you when it's ready.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex border-b pb-4">
                      <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border mr-4">
                        <img
                          src={item.orderItemImage || '/placeholder.svg'}
                          alt={item.orderItemName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.orderItemName}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-medium text-yellow-600">{order.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold">₱{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Payment Instructions</h3>
                    <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                      <li>Open your payment app</li>
                      <li>Go to "Pay Bills"</li>
                      <li>Select "Online Shopping"</li>
                      <li>Choose "Pawtopia" as the merchant</li>
                      <li>Enter amount: ₱{order.totalPrice.toFixed(2)}</li>
                      <li>Enter reference number: {order.orderID}</li>
                      <li>Complete the payment</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => navigate('/orders')}
              className="px-8 py-3"
            >
              Continue to Orders
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}