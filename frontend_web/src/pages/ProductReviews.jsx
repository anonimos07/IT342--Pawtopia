import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/Button'; // Adjusted for src/components/
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL_REVIEW = import.meta.env.VITE_API_BASE_URL_PRODUCT_REVIEW;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication and fetch reviews
  useEffect(() => {
    // Authentication check
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const googleuserString = localStorage.getItem('googleuser');
    if (token && (userString || googleuserString)) {
      setIsAuthenticated(true);
      if (googleuserString) {
        const googleuser = JSON.parse(googleuserString);
        setUser(googleuser);
      } else if (userString) {
        const regularUser = JSON.parse(userString);
        setUser(regularUser);
      }
    }

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL_REVIEW}/getReviewsByProductId/${productId}`);
        setReviews(response.data);
      } catch (err) {
        setReviewError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !user) {
      setReviewError('Please login to submit a review');
      return;
    }

    try {
      const reviewData = {
        ratings: rating,
        comment: comment.trim() || null,
        product: { productID: productId },
        user: { userId: user.userId || user.id },
      };
      await axios.post(
        `${API_BASE_URL_REVIEW}/postReview`,
        reviewData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setReviewSuccess('Review submitted successfully!');
      setRating(0);
      setHoverRating(0);
      setComment('');
      setReviewError('');

      // Refresh reviews
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL_REVIEW}/getReviewsByProductId/${productId}`);
      setReviews(response.data);
    } catch (err) {
      setReviewError(
        err.response?.status === 400
          ? 'Invalid review data. Please check your input.'
          : err.response?.data?.message || 'Failed to submit review'
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.ratings, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
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
              ({reviews.length} reviews)
            </span>
          </div>

          {/* Review Submission Form */}
          {isAuthenticated ? (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
              {reviewError && <p className="text-red-500 mb-2">{reviewError}</p>}
              {reviewSuccess && <p className="text-green-500 mb-2">{reviewSuccess}</p>}
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${
                          (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Comment (Optional)</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about the product..."
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
                >
                  Submit Review
                </Button>
              </form>
            </div>
          ) : (
            <div className="mb-6 p-4 border rounded-lg text-center">
              <p className="text-gray-600 mb-2">Please log in to write a review.</p>
              <Button
                asChild
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Display Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.reviewID} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(review.ratings)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[...Array(5 - review.ratings)].map((_, i) => (
                      <Star key={i + review.ratings} className="w-4 h-4 text-gray-300" />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-600 mb-2">{review.comment}</p>}
                <p className="text-sm text-gray-500">— {review.username || 'Anonymous'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-500">
            No reviews yet for this product.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;