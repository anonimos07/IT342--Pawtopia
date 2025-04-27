package com.example.pawtopia.pawtopia.ecommerce.Controller;


import com.example.pawtopia.pawtopia.ecommerce.Entity.Cart;
import com.example.pawtopia.pawtopia.ecommerce.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(method = RequestMethod.GET, path="/api/cart")
public class CartController {

    @Autowired
    CartService cartServ;

    @GetMapping("/test")
    public String test() {
        return "Test endpoint is working!";
    }

    //Create of CRUD
    @PostMapping("/postCartRecord")
    public Cart postCartRecord(@RequestBody Cart cart) {
        return cartServ.postCartRecord(cart);
    }

    //Read of CRUD
    @GetMapping("/getAllCarts")
    public List<Cart> getAllCarts(){
        return cartServ.getAllCarts();
    }

    @GetMapping("/getCartById/{cartId}")
    public Cart getCartById(@PathVariable Long cartId) {
        return cartServ.getCartById(cartId);
    }

    //Update of CRUD
    //This function may have no use
    @PutMapping("/putCartDetails")
    public Cart putCartDetails(@RequestParam Long cartId, @RequestBody Cart newCartDetails) {
        return cartServ.putCartDetails(cartId, newCartDetails);
    }

    //Delete of CRUD
    @DeleteMapping("/deleteCartDetails/{cartId}")
    public String deleteCart(@PathVariable Long cartId) {
        return cartServ.deleteCart(cartId);
    }
}