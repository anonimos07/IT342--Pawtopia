import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { CheckCircle, Clock, ChevronLeft, Star } from 'lucide-react';
import Footer from '../components/Footer';
import { toast } from 'sonner';

const API_BASE_URL_ORDER = import.meta.env.VITE_API_BASE_URL_ORDER;
const API_BASE_URL_REVIEW = import.meta.env.VITE_API_BASE_URL_PRODUCT_REVIEW;
const API_BASE_URL_ORDER_ITEM = import.meta.env.VITE_API_BASE_URL_ORDER_ITEM;

export default function OrderDetails() {
  const { OrderID } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [comments, setComments] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewSuccesses, setReviewSuccesses] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('googleuser') || '{}');
        const userId = user?.userId || user?.id;

        if (!token || !userId) {
          setError('Please log in to view your order details.');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL_ORDER}/getOrderDetails/${OrderID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('googleuser');
          navigate('/login');
        } else {
          setError('Failed to fetch order details.');
        }
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [OrderID, navigate]);

  const handleReviewSubmit = async (orderItem) => {
    const rating = ratings[orderItem.orderItemID] || 0;
    const comment = comments[orderItem.orderItemID] || '';

    if (rating === 0) {
      setReviewErrors((prev) => ({
        ...prev,
        [orderItem.orderItemID]: 'Please select a rating.',
      }));
      return;
    }

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('googleuser') || '{}');
    const userId = user?.userId || user?.id;

    if (!token || !userId) {
      setReviewErrors((prev) => ({
        ...prev,
        [orderItem.orderItemID]: 'Please log in to submit a review.',
      }));
      return;
    }

    try {
      const reviewData = {
        ratings: rating,
        comment: comment.trim() || '',
        product: { productID: parseInt(orderItem.productId) },
        user: { userId: userId },
        orderID: parseInt(OrderID), // Added orderID from useParams
      };

      console.log('Submitting review with data:', reviewData);

      await axios.post(
        `${API_BASE_URL_REVIEW}/postReview`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrderItem = { ...orderItem, isRated: true };
      await axios.put(
        `${API_BASE_URL_ORDER_ITEM}/updateIsRated/${orderItem.orderItemID}`,
        updatedOrderItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrder((prev) => ({
        ...prev,
        orderItems: prev.orderItems.map((item) =>
          item.orderItemID === orderItem.orderItemID ? { ...item, isRated: true } : item
        ),
      }));

      setReviewSuccesses((prev) => ({
        ...prev,
        [orderItem.orderItemID]: 'Review submitted successfully!',
      }));
      setRatings((prev) => ({ ...prev, [orderItem.orderItemID]: 0 }));
      setHoverRatings((prev) => ({ ...prev, [orderItem.orderItemID]: 0 }));
      setComments((prev) => ({ ...prev, [orderItem.orderItemID]: '' }));
      setReviewErrors((prev) => ({ ...prev, [orderItem.orderItemID]: '' }));
      toast.success('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewErrors((prev) => ({
        ...prev,
        [orderItem.orderItemID]:
          err.response?.status === 400
            ? 'Invalid review data. Please check your input.'
            : err.response?.data?.message || 'Failed to submit review.',
      }));
      toast.error('Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-medium text-red-600 mb-4">
              {error || 'Order Not Found'}
            </h2>
            <p className="mb-6">We couldn't fetch your order. Please try again.</p>
            <Button asChild>
              <Link to="/Mypurchases">Back to Orders</Link>
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
            <h1 className="text-2xl font-bold ml-4">Order Details</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Order #{order.orderID}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Status: {order.orderStatus}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {order.orderStatus === 'APPROVED'
                  ? 'Your order has been approved and delivered.'
                  : order.orderStatus === 'DECLINED'
                  ? 'Your order has been declined.'
                  : 'Your order is being processed. We’ll notify you when it’s approved.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.orderItemID} className="border-b pb-4">
                      <div className="flex mb-4">
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
                          <p className="text-sm text-gray-600">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {order.orderStatus === 'APPROVED' ? (
                        <div className="mb-6 p-4 border rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
                          {reviewErrors[item.orderItemID] && (
                            <p className="text-red-500 mb-2">{reviewErrors[item.orderItemID]}</p>
                          )}
                          {reviewSuccesses[item.orderItemID] && (
                            <p className="text-green-500 mb-2">{reviewSuccesses[item.orderItemID]}</p>
                          )}
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 cursor-pointer ${
                                    (hoverRatings[item.orderItemID] || ratings[item.orderItemID] || 0) >= star
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  onClick={() =>
                                    setRatings((prev) => ({
                                      ...prev,
                                      [item.orderItemID]: star,
                                    }))
                                  }
                                  onMouseEnter={() =>
                                    setHoverRatings((prev) => ({
                                      ...prev,
                                      [item.orderItemID]: star,
                                    }))
                                  }
                                  onMouseLeave={() =>
                                    setHoverRatings((prev) => ({
                                      ...prev,
                                      [item.orderItemID]: 0,
                                    }))
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Comment (Optional)</label>
                            <textarea
                              className="w-full p-2 border rounded"
                              rows="4"
                              value={comments[item.orderItemID] || ''}
                              onChange={(e) =>
                                setComments((prev) => ({
                                  ...prev,
                                  [item.orderItemID]: e.target.value,
                                }))
                              }
                              placeholder="Share your thoughts about the product..."
                            ></textarea>
                          </div>
                          <Button
                            onClick={() => handleReviewSubmit(item)}
                            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
                          >
                            Submit Review
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          Reviews can be submitted once the order is approved.
                        </p>
                      )}
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
            <Button onClick={() => navigate('/Mypurchases')} className="px-8 py-3">
              Back to Orders
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}