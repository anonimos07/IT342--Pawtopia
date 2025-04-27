package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.CartItem;
import com.example.pawtopia.pawtopia.ecommerce.Repository.CartItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CartItemService {
    @Autowired
    CartItemRepo cartItemRepo;

    public CartItemService() {
        super();
        // TODO Auto-generated constructor stub
    }

    //Create of CRUD
    //Create cartItem Record
    public CartItem postCartItem(CartItem cartItem) {
        if (cartItem.getQuantity() <= 0) {
            // Optionally throw an exception or return null
            throw new IllegalArgumentException("Quantity must be greater than 0");
            // Or return null, or handle as needed
            // return null;
        }
        return cartItemRepo.save(cartItem);
    }

    //Read of CRUD
    public List<CartItem> getAllCartItems(){
        return cartItemRepo.findAll();
    }

    //Update of CRUD
    public CartItem updateCartItem(int cartItemId, CartItem newCartItemDetails) {
        try {
            // Search for the cartItem by ID
            CartItem cartItem = cartItemRepo.findById(cartItemId).orElseThrow(() ->
                    new NoSuchElementException("CartItem " + cartItemId + " not found"));

            // If ID found, set new values
            cartItem.setQuantity(newCartItemDetails.getQuantity());
            cartItem.setLastUpdated(LocalDateTime.now());

            // Save the updated cartItem
            return cartItemRepo.save(cartItem);
        } catch (NoSuchElementException nex) {
            throw nex; // Re-throw the exception

        }
    }

    //Doesn't update time last updated
    public CartItem systemUpdateCartItem(int cartItemId, CartItem newCartItemDetails) {
        try {
            // Search for the cartItem by ID
            CartItem cartItem = cartItemRepo.findById(cartItemId).orElseThrow(() ->
                    new NoSuchElementException("CartItem " + cartItemId + " not found"));

            // If ID found, set new values
            cartItem.setQuantity(newCartItemDetails.getQuantity());

            // Save the updated cartItem
            return cartItemRepo.save(cartItem);
        } catch (NoSuchElementException nex) {
            throw nex; // Re-throw the exception

        }
    }

    //Delete of CRUD
    public String deleteCartItem(int cartItemId) {
        String msg = "";
        if (cartItemRepo.findById(cartItemId).isPresent()) {
            cartItemRepo.deleteById(cartItemId);
            msg = "CartItem Successfully deleted";
        }else {
            msg = cartItemId + " NOT found";
        }
        return msg;
    }
}