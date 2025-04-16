package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import com.example.pawtopia.pawtopia.ecommerce.Service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(method = RequestMethod.GET, path="/api/order")
public class OrderController {

    @Autowired
    private final OrderService oserv;

    // CREATE
    //user
    @PostMapping("/postOrderRecord")
    public Order postOrderRecord(@RequestBody Order order) {
        return oserv.postOrderRecord(order);
    }

    // READ
    //admin
    @GetMapping("/getAllOrders")
    public List<Order> getAllOrder() {
        return oserv.getAllOrder();
    }

    //admin
    @GetMapping("/getOrderDetails/{orderID}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable int orderID) {
        Order order = oserv.getOrderDetails(orderID);
        return ResponseEntity.ok(order);
    }

    //admin
    @GetMapping("/getAllOrdersByUserId")
    public List<Order> getAllOrdersByUserId(@RequestParam Long userId) {
        return oserv.getAllOrdersByUserId(userId);
    }

    //admin
    @GetMapping("/get-total-income")
    public Double getTotalIncome() {
        // Call the service method to get the total income
        return oserv.getTotalIncome();
    }

    // UPDATE
    //user
    @PutMapping("/putOrderDetails")
    public Order putOrderDetails(@RequestParam int id, @RequestBody Order newOrderDetails) {
        return oserv.putOrderDetails(id, newOrderDetails);
    }

    // DELETE
    //user
    @DeleteMapping("/deleteOrderDetails/{id}")
    public String deleteOrder(@PathVariable int id) {
        return oserv.deleteOrder(id);
    }

}