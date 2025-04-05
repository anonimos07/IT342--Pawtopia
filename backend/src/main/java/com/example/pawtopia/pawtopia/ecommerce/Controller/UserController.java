package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
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

//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody User user) {
//        Optional<User> existingUser = userService.login(user.getUsername(), user.getPassword());
//
//        if (existingUser.isEmpty()) {
//            return ResponseEntity.status(401).body(Map.of("message", "Invalid user or password."));
//        }
//
//        String role = existingUser.get().getRole();
//        String message;
//        if ("ADMIN".equalsIgnoreCase(role)) {
//            message = "Admin login successful!";
//        } else if ("CUSTOMER".equalsIgnoreCase(role)) {
//            message = "Customer login successful!";
//        } else {
//            return ResponseEntity.status(403).body(Map.of("message", "Role not recognized."));
//        }
//
//        return ResponseEntity.ok(Map.of(
//                "id", existingUser.get().getUserId().toString(),
//                "message", message,
//                "username", existingUser.get().getUsername(),
//                "role", role,
//                "email", existingUser.get().getEmail()
//        ));
//    }



//    @PostMapping("/login")
//    public String login(User user){
//        return userService.verify(user);
//    }
@PostMapping("/login")
public ResponseEntity<String> login(@RequestBody User user) {
    String result = userService.verify(user);
    if (result.equals("failed")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
    return ResponseEntity.ok(result);
}
}
