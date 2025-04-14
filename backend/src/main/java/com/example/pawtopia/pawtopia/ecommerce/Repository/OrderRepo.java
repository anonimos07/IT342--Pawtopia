package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUser_UserId(Long userId);  // Correct: matches User.userId

    @Query("SELECT SUM(o.totalPrice) FROM Order o")
    Double calculateTotalIncome();

}
