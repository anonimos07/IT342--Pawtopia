package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import com.example.pawtopia.pawtopia.ecommerce.Entity.OrderItem;
import com.example.pawtopia.pawtopia.ecommerce.Repository.OrderItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.NameNotFoundException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OrderItemService {

    @Autowired
    OrderItemRepo oirepo;

    public OrderItemService() {
        super();
    }

    public OrderItem postOrderItemRecord(OrderItem orderItem) {
        return oirepo.save(orderItem);
    }
//public OrderItem postOrderItemRecord(OrderItem orderItem) {
//    // Attach the managed Order entity to avoid detached entity error
//    OrderItem order = oirepo.findById(orderItem.getOrder().getOrderID())
//            .orElseThrow(() -> new RuntimeException("Order not found"));
//
//    orderItem.setOrder(order.getOrder());
//
//    return oirepo.save(orderItem);
//}

    public List<OrderItem> getAllOrderItem() {
        return oirepo.findAll();
    }

    @SuppressWarnings("finally")
    public OrderItem putOrderItemDetails(int id, OrderItem newOrderItemDetails) {
        OrderItem orderItem = new OrderItem();

        try {
            orderItem = oirepo.findById(id).get();

            orderItem.setOrderItemName(newOrderItemDetails.getOrderItemName());
            orderItem.setOrderItemImage(newOrderItemDetails.getOrderItemImage());
            orderItem.setPrice(newOrderItemDetails.getPrice());
            orderItem.setQuantity(newOrderItemDetails.getQuantity());
            orderItem.setIsRated(newOrderItemDetails.isRated());
        } catch(NoSuchElementException nex) {
            throw new NameNotFoundException("Order " + id + " not found");
        } finally {
            return oirepo.save(orderItem);
        }
    }

    public String deleteItemOrder(int id) {
        String msg = "";
        if(oirepo.findById(id).isPresent()) {
            oirepo.deleteById(id);
            msg = "Order successfully deleted!";
        } else {
            msg = id +  " NOT found";
        }
        return msg;
    }

    public OrderItem updateIsRated(int id, OrderItem newOrderItemDetails) {
        try {
            OrderItem orderItem = oirepo.findById(id).orElseThrow(() ->
                    new NoSuchElementException("OrderItem " + id + " not found"));
            orderItem.setIsRated(newOrderItemDetails.isRated());
            return oirepo.save(orderItem);
        } catch (NoSuchElementException nex) {
            throw nex;
        }
    }
}