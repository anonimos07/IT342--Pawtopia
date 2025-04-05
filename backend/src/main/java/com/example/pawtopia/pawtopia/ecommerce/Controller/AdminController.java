package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Admin;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Service.AdminService;
import com.example.pawtopia.pawtopia.ecommerce.Service.CustomerUserDetailsService;
import com.example.pawtopia.pawtopia.ecommerce.Service.JwtService;
import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final UserService userService;

    @Autowired
    private final CustomerUserDetailsService userDetailsService;
    @Autowired
    private JwtService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    @PostMapping("/add")
    public ResponseEntity<String> addAdmin(@RequestBody Admin admin) {
        adminService.saveAdmin(admin);
        return ResponseEntity.ok("Admin added successfully!");
    }

//    @PostMapping("/login")
//    public ResponseEntity<String> loginAdmin(@RequestBody String username, @RequestBody String password){
//        Optional<Admin> admin = adminService.findByUsernameAndPassword(username, password);
//        if(admin.isPresent()){
//            return  ResponseEntity.ok("Admin Loggedin Successfully!");
//        }else{
//            return ResponseEntity.status(401).body("Invalid Credentials!");
//        }
//    }

//    @PostMapping("/login")
//    public ResponseEntity<String> login(@RequestBody Admin admin) {
//        String result = adminService.verify(admin);
//        if (result.equals("failed")) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
//        }
//        return ResponseEntity.ok(result);
//    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Admin admin) {
        try {
            // Set auth type before authentication
            ((CustomerUserDetailsService) userDetailsService).setAuthType("ADMIN");

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(admin.getUsername(), admin.getPassword())
            );

            if (authentication.isAuthenticated()) {
                return ResponseEntity.ok(jwtService.generateToken(admin.getUsername()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed");
        } finally {
            // Clear auth type after authentication
            ((CustomerUserDetailsService) userDetailsService).setAuthType(null);
        }
    }
}
