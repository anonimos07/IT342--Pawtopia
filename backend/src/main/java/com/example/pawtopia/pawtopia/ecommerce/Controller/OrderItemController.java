package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.OrderItem;
import com.example.pawtopia.pawtopia.ecommerce.Service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(method = RequestMethod.GET, path="/api/orderItem")
public class OrderItemController {

    @Autowired
    OrderItemService oiserv;

    // CREATE
    @PostMapping("/postOrderItemRecord")
    public OrderItem postOrderItemRecord(@RequestBody OrderItem order) {
        return oiserv.postOrderItemRecord(order);
    }

    // READ
    @GetMapping("/getAllOrdersItem")
    public List<OrderItem> getAllOrderItem() {
        return oiserv.getAllOrderItem();
    }

    // UPDATE
    @PutMapping("/putOrderItemDetails")
    public OrderItem putOrderItemDetails(@RequestParam int id, @RequestBody OrderItem newOrderItemDetails) {
        return oiserv.putOrderItemDetails(id, newOrderItemDetails);
    }

    // DELETE
    @DeleteMapping("/deleteOrderItemDetails/{id}")
    public String deleteOrderItem(@PathVariable int id) {
        return oiserv.deleteItemOrder(id);
    }

    // UPDATE
    @PutMapping("/updateIsRated/{id}")
    public OrderItem updateIsRated(@PathVariable int id, @RequestBody OrderItem newOrderItemDetails) {
        return oiserv.putOrderItemDetails(id, newOrderItemDetails);
    }


}