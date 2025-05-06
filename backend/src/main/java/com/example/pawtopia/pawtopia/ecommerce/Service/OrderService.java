package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import com.example.pawtopia.pawtopia.ecommerce.Entity.OrderItem;
import com.example.pawtopia.pawtopia.ecommerce.Entity.Product;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.OrderRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.ProductRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.NameNotFoundException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    OrderRepo orepo;

    @Autowired
    ProductRepo productRepository;

    @Autowired
    UserRepo userRepo;

    public OrderService() {
        super();
    }

    public Order postOrderRecord(Order order) {
        Long userId = order.getUser().getUserId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUser(user);

        // Set default orderStatus to PENDING if not provided
        if (order.getOrderStatus() == null || order.getOrderStatus().trim().isEmpty()) {
            order.setOrderStatus("PENDING");
        }

        if (order.getOrderItems() != null) {
            for (OrderItem orderItem : order.getOrderItems()) {
                Optional<Product> optionalProduct = productRepository.findById(Integer.parseInt(orderItem.getProductId()));
                if (optionalProduct.isPresent()) {
                    Product product = optionalProduct.get();
                    product.setQuantity(product.getQuantity() - orderItem.getQuantity());
                    product.setQuantitySold(product.getQuantitySold() + orderItem.getQuantity());
                    productRepository.save(product);
                } else {
                    throw new RuntimeException("Product not found with ID: " + orderItem.getProductId());
                }
                orderItem.setOrder(order);
            }
        }
        return orepo.save(order);
    }

    public OrderService(OrderRepo orderRepository) {
        this.orepo = orderRepository;
    }

    public Order getOrderDetails(int orderID) {
        return orepo.findById(orderID)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getAllOrdersByUserId(Long userId) {
        return orepo.findByUser_UserId(userId);
    }

    public List<Order> getAllOrder() {
        return orepo.findAll();
    }

    @SuppressWarnings("finally")
    public Order putOrderDetails(int id, Order newOrderDetails) {
        Order order = new Order();

        try {
            order = orepo.findById(id).get();

            order.setOrderDate(newOrderDetails.getOrderDate());
            order.setPaymentMethod(newOrderDetails.getPaymentMethod());
            order.setPaymentStatus(newOrderDetails.getPaymentStatus());
            order.setOrderStatus(newOrderDetails.getOrderStatus());
            order.setTotalPrice(newOrderDetails.getTotalPrice());
            order.setUser(newOrderDetails.getUser());
        } catch(NoSuchElementException nex) {
            throw new NameNotFoundException("Order " + id + " not found");
        } finally {
            return orepo.save(order);
        }
    }

    public Order updateOrderStatus(int id, String status) {
        Order order = orepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order " + id + " not found"));
        order.setOrderStatus(status);
        if (status.equals("APPROVED")) {
            order.setPaymentStatus("PAID");
        } else if (status.equals("DECLINED")) {
            order.setPaymentStatus("CANCELLED");
        }
        return orepo.save(order);
    }

    public String deleteOrder(int id) {
        String msg = "";
        if(orepo.findById(id).isPresent()) {
            orepo.deleteById(id);
            msg = "Order successfully deleted!";
        } else {
            msg = id +  " NOT found";
        }
        return msg;
    }

    public Double getTotalIncome() {
        return orepo.calculateTotalIncome();
    }

    public Order findById(Integer orderId) {
        return orepo.findById(orderId)
                .orElse(null);
    }
}