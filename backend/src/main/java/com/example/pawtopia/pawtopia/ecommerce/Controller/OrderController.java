package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import com.example.pawtopia.pawtopia.ecommerce.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService oserv;

    @GetMapping("/test")
    public void test() {
        System.out.println("Test for order");
    }

    @PostMapping("/postOrderRecord")
    public ResponseEntity<Order> postOrderRecord(@RequestBody Order order) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        if (!order.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }
        Order savedOrder = oserv.postOrderRecord(order);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/getAllOrders")
    public List<Order> getAllOrder() {
        return oserv.getAllOrder();
    }

    @GetMapping("/getOrderDetails/{orderID}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable int orderID) {
        Order order = oserv.getOrderDetails(orderID);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/getAllOrdersByUserId")
    public List<Order> getAllOrdersByUserId(@RequestParam Long userId) {
        return oserv.getAllOrdersByUserId(userId);
    }

    @GetMapping("/get-total-income")
    public Double getTotalIncome() {
        return oserv.getTotalIncome();
    }

    @PutMapping("/putOrderDetails")
    public Order putOrderDetails(@RequestParam int id, @RequestBody Order newOrderDetails) {
        return oserv.putOrderDetails(id, newOrderDetails);
    }

    @PutMapping("/updateStatus/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable int id, @RequestParam String status) {
        if (!status.equals("APPROVED") && !status.equals("DECLINED")) {
            return ResponseEntity.badRequest().build();
        }
        Order updatedOrder = oserv.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/deleteOrderDetails/{id}")
    public String deleteOrder(@PathVariable int id) {
        return oserv.deleteOrder(id);
    }
}