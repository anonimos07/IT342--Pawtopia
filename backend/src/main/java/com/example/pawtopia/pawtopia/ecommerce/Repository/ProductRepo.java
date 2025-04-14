package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product,Integer> {

}