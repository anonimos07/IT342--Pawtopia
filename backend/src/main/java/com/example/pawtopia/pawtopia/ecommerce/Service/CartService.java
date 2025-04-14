package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Cart;
import com.example.pawtopia.pawtopia.ecommerce.Repository.CartRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    CartRepo cartRepo;

    public CartService() {
        super();
        // TODO Auto-generated constructor stub
    }

    //Create of CRUD
    public Cart postCartRecord(Cart cart) {
        return cartRepo.save(cart);
    }

    //Read of CRUD
    public List<Cart> getAllCarts(){
        return cartRepo.findAll();
    }

    public Cart getCartById(Long cartId) {
        Optional<Cart> cartOptional = cartRepo.findById(cartId);
        if (cartOptional.isPresent()) {
            return cartOptional.get();
        } else {
            // Handle case where cart is not found (throw an exception, return null, etc.)
            throw new RuntimeException("Cart not found for id: " + cartId);
        }
    }

    //Update of CRUD
    //This function may have no use
    public Cart putCartDetails(Long cartId, Cart newCartDetails) {
        try {
            // Search for the cart by ID
            Cart cart = cartRepo.findById(cartId).orElseThrow(() ->
                    new NoSuchElementException("Cart " + cartId + " not found"));

            // If ID found, set new values
            //new values here

            // Save the updated cart
            return cartRepo.save(cart);
        } catch (NoSuchElementException nex) {
            throw nex; // Re-throw the exception

        }
    }

    //Delete of CRUD
    public String deleteCart(Long cartId) {
        String msg = "";
        if (cartRepo.findById(cartId).isPresent()) {
            cartRepo.deleteById(cartId);
            msg = "Cart Successfully deleted";
        }else {
            msg = cartId + " NOT found";
        }
        return msg;
    }
}