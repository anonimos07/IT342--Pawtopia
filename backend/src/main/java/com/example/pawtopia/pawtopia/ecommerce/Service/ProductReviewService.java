package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.ProductReview;
import com.example.pawtopia.pawtopia.ecommerce.Repository.ProductReviewRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductReviewService {

    @Autowired
    private ProductReviewRepo productReviewRepo;

    private static final Logger logger = LoggerFactory.getLogger(ProductReviewService.class);

    public ProductReviewService() {
        super();
    }

    public ProductReview postProductReviewRecord(ProductReview review) {
        try {
            logger.info("Attempting to save review: {}", review);
            ProductReview savedReview = productReviewRepo.save(review);
            logger.info("Review saved successfully: {}", savedReview);
            return savedReview;
        } catch (Exception e) {
            logger.error("Failed to save review: {}", e.getMessage(), e);
            throw e; // Re-throw the exception to propagate the error
        }
    }

    public List<ProductReview> getAllReview() {
        logger.info("Fetching all reviews");
        return productReviewRepo.findAll();
    }

    public ProductReview getReviewById(int id) {
        logger.info("Fetching review by ID: {}", id);
        return productReviewRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Review with id " + id + " not found."));
    }

    public ProductReview updateReview(int id, ProductReview productReviewRecord) {
        logger.info("Updating review with ID: {}", id);
        ProductReview existingReview = productReviewRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Review with id " + id + " not found."));

        existingReview.setRatings(productReviewRecord.getRatings());
        existingReview.setComment(productReviewRecord.getComment()); // Ensure comment is updated as well
        return productReviewRepo.save(existingReview);
    }

    public String deleteReview(int id) {
        logger.info("Deleting review with ID: {}", id);
        String msg;

        if (productReviewRepo.existsById(id)) {
            productReviewRepo.deleteById(id);
            msg = "Review record successfully deleted.";
        } else {
            msg = "Review with id " + id + " not found.";
        }
        return msg;
    }

    public List<ProductReview> getReviewsByProductId(int productId) {
        return productReviewRepo.findReviewsByProductId(productId);
    }

}
