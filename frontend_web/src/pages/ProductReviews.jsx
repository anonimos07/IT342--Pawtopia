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
        console.log("API Response:", response.data); // Debug: Check what data we're receiving
        setReviews(response.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviewError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  // Debug: Log the reviews state to verify what we have
  useEffect(() => {
    console.log("Current reviews state:", reviews);
    if (reviews.length > 0) {
      console.log("First review example:", reviews[0]);
      console.log("Rating type:", typeof reviews[0].ratings);
      console.log("Username example:", reviews[0].username);
    }
  }, [reviews]);

  // Calculate average rating safely with fallback for string ratings
  const calculateAverage = () => {
    if (reviews.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    reviews.forEach(review => {
      // Convert to number if it's a string, or use 0 if conversion fails
      const rating = Number(review.ratings);
      if (!isNaN(rating)) {
        total += rating;
        count++;
      }
    });
    
    return count > 0 ? total / count : 0;
  };

  const averageRating = calculateAverage();
  console.log("Calculated average rating:", averageRating); // Debug: Check our calculation

  if (loading) {
    return (
      <div>
        <h2>Product Reviews</h2>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Product Reviews</h2>
      
      <div className="mb-4">
        <div className="flex items-center">
          <p className="mr-2">
            {!isNaN(averageRating) ? averageRating.toFixed(1) : "0"} out of 5
          </p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={star <= Math.round(averageRating) ? "gold" : "none"}
                color={star <= Math.round(averageRating) ? "gold" : "gray"}
              />
            ))}
          </div>
          <span className="ml-2">({reviews.length} reviews)</span>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            // Ensure rating is a number
            const rating = Number(review.ratings);
            console.log(`Review ${index} rating:`, rating); // Debug: Check each review's rating
            
            return (
              <div key={index} className="border p-4 rounded">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        fill={star <= rating ? "gold" : "none"}
                        color={star <= rating ? "gold" : "gray"}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2">{review.comment}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  — {review.username || 'Anonymous'}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No reviews yet for this product.</p>
      )}
      
      {/* Debug section - remove in production */}
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}>
        <h3>Debug Info:</h3>
        <p>Number of reviews: {reviews.length}</p>
        <p>Average Rating: {averageRating}</p>
        <p>Raw reviews data:</p>
        <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(reviews, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ProductReviews;