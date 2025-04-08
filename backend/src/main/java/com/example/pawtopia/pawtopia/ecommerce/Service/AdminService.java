package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Admin;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.AdminRepo;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    @PostConstruct
    public void adminAcc(){
        String defUser = "admin1";
        String defPass = "admin123";

        if(!adminRepo.existsByUsername(defUser)){
            Admin admin = new Admin();
            admin.setUsername(defUser);
            admin.setPassword(passwordEncoder.encode(defPass));
            admin.setRole("ADMIN");
            adminRepo.save(admin);
            System.out.println("Default admin created with encoded password");
        }
    }

    //get all admin
    public List<Admin> getAllAdmins(){
        return adminRepo.findAll();
    }

    //create
    public Admin saveAdmin(Admin admin){
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole("ADMIN");
        return adminRepo.save(admin);
    }

    public Optional<Admin> findByUsernameAndPassword(String username, String password) {
        Optional<Admin> admin = adminRepo.findByUsername(username);
        if (admin.isPresent() && passwordEncoder.matches(password, admin.get().getPassword())) {
            return admin;
        }
        return Optional.empty();
    }

    public String verify(Admin admin){
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(admin.getUsername(), admin.getPassword()));
        if (authentication.isAuthenticated())
            return jwtService.generateToken(admin.getUsername());

        return "failed";
    }


}
