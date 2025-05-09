package com.example.pawtopia.pawtopia.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "Reviews")
public class ProductReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ReviewID;

    private int ratings;

    @Column(nullable = true)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productid", nullable = false)
    @JsonBackReference("product-productreview")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    @JsonBackReference("user-productreview")
    private User user;

    @Column(name = "orderid", nullable = false)
    private int orderID; // Add this field

    @JsonProperty("username")
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    public ProductReview() {}

    public ProductReview(int reviewID, int ratings, String comment, Product product, User user, int orderID) {
        this.ReviewID = reviewID;
        this.ratings = ratings;
        this.comment = comment;
        this.product = product;
        this.user = user;
        this.orderID = orderID; // Initialize orderID
    }

    public int getReviewID() {
        return ReviewID;
    }

    public void setReviewID(int reviewID) {
        ReviewID = reviewID;
    }

    public int getRatings() {
        return ratings;
    }

    public void setRatings(int ratings) {
        this.ratings = ratings;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getOrderID() {
        return orderID;
    }

    public void setOrderID(int orderID) {
        this.orderID = orderID;
    }
}