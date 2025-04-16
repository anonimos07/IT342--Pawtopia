package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Integer> {
}
