package com.example.pawtopia.pawtopia.ecommerce.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class testHomeController {
    @GetMapping("/")
    public String home() {
        return "Pawtopia backend is live! 🐾";
    }
}
