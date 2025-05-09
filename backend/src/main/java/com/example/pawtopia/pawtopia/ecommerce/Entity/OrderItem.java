package com.example.pawtopia.pawtopia.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderItemID;
    private String orderItemName;

    @Column(columnDefinition = "TEXT")
    private String orderItemImage;

    private double price;
    private int quantity;

    @Column(name = "product_id", nullable = true)
    private String productId;

    private boolean isRated;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public OrderItem() {
        super();
        this.isRated = false;
    }

    public OrderItem(int orderItemID, String orderItemName, String orderItemImage, double price, int quantity,
                     String productId, boolean isRated, Order order) {
        super();
        this.orderItemID = orderItemID;
        this.orderItemName = orderItemName;
        this.orderItemImage = orderItemImage;
        this.price = price;
        this.quantity = quantity;
        this.productId = productId;
        this.isRated = isRated;
        this.order = order;
    }

    // Explicit getter and setter for isRated to bypass Lombok issue
    public boolean isRated() {
        return isRated;
    }

    public void setIsRated(boolean isRated) {
        this.isRated = isRated;
    }
}