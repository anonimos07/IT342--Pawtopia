package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductReviewRepo extends JpaRepository<ProductReview, Integer> {
    @Query("SELECT r FROM ProductReview r WHERE r.product.ProductID = :productId")
    List<ProductReview> findReviewsByProductId(@Param("productId") int productId);

}
