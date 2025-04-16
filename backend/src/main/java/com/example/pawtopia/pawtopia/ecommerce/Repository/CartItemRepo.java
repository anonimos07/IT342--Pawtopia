package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Integer> {

}