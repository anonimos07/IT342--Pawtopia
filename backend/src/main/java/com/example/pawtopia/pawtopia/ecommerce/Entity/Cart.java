package com.example.pawtopia.pawtopia.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Cart {
    @Id
    private Long cartId; //UserEntity PK is also cart PK

    @OneToOne
    @MapsId //For CartEntity to use same PK as user
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-cart")
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
    @JsonManagedReference("cart-cartItem")
    private List<CartItem> cartItems;

    public Cart() {
        super();
        // TODO Auto-generated constructor stub
    }

    public Cart(Long cartId, List<CartItem> cartItem, User user) {
        super();
        this.cartId = cartId;
        this.cartItems = cartItem;
        this.user = user;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }


}