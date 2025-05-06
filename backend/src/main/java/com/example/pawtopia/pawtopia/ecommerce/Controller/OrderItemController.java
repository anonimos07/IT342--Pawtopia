package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.OrderItem;
import com.example.pawtopia.pawtopia.ecommerce.Service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/orderItem")
public class OrderItemController {

    @Autowired
    OrderItemService oiserv;

    @GetMapping("/test")
    public String test(){
        return "test";
    }

    @PostMapping("/postOrderItemRecord")
    public OrderItem postOrderItemRecord(@RequestBody OrderItem orderItem) {
        return oiserv.postOrderItemRecord(orderItem);
    }

    @GetMapping("/getAllOrdersItem")
    public List<OrderItem> getAllOrderItem() {
        return oiserv.getAllOrderItem();
    }

    @PutMapping("/putOrderItemDetails")
    public OrderItem putOrderItemDetails(@RequestParam int id, @RequestBody OrderItem newOrderItemDetails) {
        return oiserv.putOrderItemDetails(id, newOrderItemDetails);
    }

    @DeleteMapping("/deleteOrderItemDetails/{id}")
    public String deleteOrderItem(@PathVariable int id) {
        return oiserv.deleteItemOrder(id);
    }

    @PutMapping("/updateIsRated/{id}")
    public ResponseEntity<OrderItem> updateIsRated(@PathVariable int id, @RequestBody OrderItem newOrderItemDetails) {
        try {
            OrderItem updatedItem = oiserv.updateIsRated(id, newOrderItemDetails);
            return ResponseEntity.ok(updatedItem);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(null);
        }
    }
}