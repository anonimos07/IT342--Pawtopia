package com.example.pawtopia.pawtopia.ecommerce.Repository;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Admin;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
//    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndPassword(String username, String password);
    Optional<User> findByEmail(String email);
}
