package com.example.pawtopia.pawtopia.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name="tblproduct")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ProductID;

    private String description;
    private double productPrice;
    private String productName;
    private String productType;
    private int quantity;
    private int quantitySold;

    @Column(columnDefinition = "TEXT")
    private String productImage;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference("product-productreview")
    private List<ProductReview> productreview;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<CartItem> cartItems;

    // Constructors
    public Product() {
        super();
        this.quantitySold = 0;
    }

    public Product(int productID, String description, double productPrice, String productName, String productType,
                         int quantity, int quantitySold, String productImage, List<ProductReview> productreview,
                         List<CartItem> cartItems) {
        super();
        ProductID = productID;
        this.description = description;
        this.productPrice = productPrice;
        this.productName = productName;
        this.productType = productType;
        this.quantity = quantity;
        this.quantitySold = quantitySold;
        this.productImage = productImage;
        this.productreview = productreview;
        this.cartItems = cartItems;
    }

    public int getProductID() {
        return ProductID;
    }

    public void setProductID(int productID) {
        ProductID = productID;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(double productPrice) {
        this.productPrice = productPrice;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public List<ProductReview> getProductreview() {
        return productreview;
    }

    public void setProductreview(List<ProductReview> productreview) {
        this.productreview = productreview;
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }


}