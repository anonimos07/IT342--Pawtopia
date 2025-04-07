package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Address;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepo userRepo;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody User user) {
        String result = userService.signUp(user);
        if (result.equals("Username already registered!")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }


    //find user by id
    @GetMapping("/user/{id}")
    public ResponseEntity<Map<String, String>> getUserProfile(@PathVariable String id) {
        try {
            Long userId = Long.parseLong(id);
            Optional<User> userOptional = userRepo.findById(userId);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found."));
            }

            User user = userOptional.get();
            return ResponseEntity.ok(Map.of(
                    "username", user.getUsername(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
            ));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid user ID format."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        String result = userService.verify(user);
        if (result.equals("failed")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("user/{id}/address")
    public ResponseEntity<String> updateUserAddress(
            @PathVariable Long id,
            @RequestBody Address address
    ) {
        try {
            userService.updateAddress(id, address);
            return ResponseEntity.ok("Address updated successfully.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update address.");
        }
    }
}
