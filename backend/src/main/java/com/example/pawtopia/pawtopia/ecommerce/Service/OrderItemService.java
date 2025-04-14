package com.example.pawtopia.pawtopia.ecommerce.Service;

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
            // Search for the orderItem by ID
            OrderItem orderItem = oirepo.findById(id).orElseThrow(() ->
                    new NoSuchElementException("OrderItem " + id + " not found"));

            // If ID found, set new values
            orderItem.setQuantity(newOrderItemDetails.getQuantity());

            // Save the updated orderItem
            return oirepo.save(orderItem);
        } catch (NoSuchElementException nex) {
            throw nex; // Re-throw the exception

        }
    }
}