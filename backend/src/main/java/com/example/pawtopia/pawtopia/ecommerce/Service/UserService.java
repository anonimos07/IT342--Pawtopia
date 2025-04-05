package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    @Autowired
    private final UserRepo userRepo;

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    public String signUp(User user) {
        Optional<User> existingUser = userRepo.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            return "Username already registered!";
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return "User registered successfully!";
    }

//    public Optional<User> login(String username, String password) {
//        Optional<User> optionalUser = userRepo.findByUsername(username);
//        if (optionalUser.isPresent() && passwordEncoder.matches(password, optionalUser.get().getPassword())) {
//            return optionalUser;
//        }
//        return Optional.empty();
//    }
    public String verify(User user){
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        if (authentication.isAuthenticated())
                return jwtService.generateToken(user.getUsername());

        return "failed";
    }

    //find userid
    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }
}
