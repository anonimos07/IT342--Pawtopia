package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Product;
import com.example.pawtopia.pawtopia.ecommerce.Entity.ProductReview;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.ProductRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import com.example.pawtopia.pawtopia.ecommerce.Service.ProductReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/review")
public class ProductReviewController {

    @Autowired
    private ProductReviewService reviewserv;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ProductRepo productRepository;

    private static final Logger logger = LoggerFactory.getLogger(ProductReviewController.class);

    @PostMapping("/postReview")
    public ResponseEntity<ProductReview> postProductReviewRecord(@RequestBody ProductReview review, Authentication authentication) {
        try {
            logger.info("Received review: {}", review);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                logger.error("User not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            if (review.getRatings() == 0 || review.getProduct() == null) {
                logger.error("Invalid request data: {}", review);
                return ResponseEntity.badRequest().body(null);
            }
            Optional<Product> productOpt = productRepository.findById(review.getProduct().getProductID());
            if (productOpt.isEmpty()) {
                logger.error("Product not found");
                return ResponseEntity.badRequest().body(null);
            }
            review.setUser(userOpt.get());
            review.setProduct(productOpt.get());
            ProductReview savedReview = reviewserv.postProductReviewRecord(review);
            return ResponseEntity.ok(savedReview);
        } catch (IllegalStateException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            logger.error("Error posting review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getReview")
    public List<ProductReview> getAllReview() {
        return reviewserv.getAllReview();
    }

    @GetMapping("/getReview/{id}")
    public ResponseEntity<ProductReview> getReviewById(@PathVariable int id) {
        ProductReview review = reviewserv.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/putReview/{id}")
    public ProductReview updateReview(@PathVariable int id, @RequestBody ProductReview reviewRecord) {
        return reviewserv.updateReview(id, reviewRecord);
    }

    @DeleteMapping("/deleteReview/{id}")
    public String deleteReview(@PathVariable int id) {
        return reviewserv.deleteReview(id);
    }

    @GetMapping("/getReviewsByProductId/{productId}")
    public List<ProductReview> getReviewsByProductId(@PathVariable int productId) {
        return reviewserv.getReviewsByProductId(productId);
    }
}