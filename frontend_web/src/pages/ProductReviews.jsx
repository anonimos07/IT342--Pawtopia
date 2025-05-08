import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL_REVIEW = import.meta.env.VITE_API_BASE_URL_PRODUCT_REVIEW;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
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
        </div>

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