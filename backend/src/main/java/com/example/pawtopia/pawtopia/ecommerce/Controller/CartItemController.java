package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.CartItem;
import com.example.pawtopia.pawtopia.ecommerce.Service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(method = RequestMethod.GET, path="/api/cartItem")
public class CartItemController {

    @Autowired
    CartItemService cartItemServ;

    @GetMapping("/test")
    public String test() {
        return "Test endpoint is working!";
    }

    //Create CartItem record
    @PostMapping("/postCartItem")
    public CartItem postCartItem(@RequestBody CartItem cartItem) {
        return cartItemServ.postCartItem(cartItem);
    }

    //Get all cart items
    @GetMapping("/getAllCartItems")
    public List<CartItem> getAllCartItems(){
        return cartItemServ.getAllCartItems();
    }

    //Update cart item
    @PutMapping("/updateCartItem/{cartItemId}")
    public CartItem updateCartItem(@PathVariable int cartItemId, @RequestBody CartItem newCartItemDetails) {
        return cartItemServ.updateCartItem(cartItemId, newCartItemDetails);
    }

    //Update cart item
    @PutMapping("/systemUpdateCartItem/{cartItemId}")
    public CartItem systemUpdateCartItem(@PathVariable int cartItemId, @RequestBody CartItem newCartItemDetails) {
        return cartItemServ.systemUpdateCartItem(cartItemId, newCartItemDetails);
    }

    //Delete cart item
    @DeleteMapping("/deleteCartItem/{cartItemId}")
    public String deleteCartItem(@PathVariable int cartItemId) {
        return cartItemServ.deleteCartItem(cartItemId);
    }
}
