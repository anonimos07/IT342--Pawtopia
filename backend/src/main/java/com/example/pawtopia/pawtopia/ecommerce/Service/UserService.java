package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Address;
import com.example.pawtopia.pawtopia.ecommerce.Entity.Cart;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

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

    // register bago na user
    public String signUp(User user) {
        Optional<User> existingUser = userRepo.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            return "Username already registered!";
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }

        if (user.getCart() == null) {
            Cart cart = new Cart();
            cart.setUser(user);  // This sets cartId = userId (via @MapsId)
            user.setCart(cart);  // Bidirectional relationship
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return "User registered successfully!";
    }

    public List<User> findAll() {
        return userRepo.findAll();
    }

    // verify user nya generate token after verification
//    public String verify(User user){
//        Authentication authentication =
//                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
//        if (authentication.isAuthenticated())
//                return jwtService.generateToken(user.getUsername());
//
//        return "failed";
//    }


//    public String verify(User user) {
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
//        );
//
//        if (authentication.isAuthenticated()) {
//            Optional<User> foundUser = userRepo.findByUsername(user.getUsername());
//
//            if (foundUser.isPresent()) {
//                return jwtService.generateToken(user.getUsername());
//            } else {
//                return "unauthorized";
//            }
//        }
//        return "failed";
//    }

    public Map<String, Object> verify(User user) {
        try {
            // Authenticate credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                Optional<User> foundUser = userRepo.findByUsername(user.getUsername());

                if (foundUser.isPresent()) {
                    User actualUser = foundUser.get();
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", jwtService.generateToken(user.getUsername()));
                    response.put("userId", actualUser.getUserId());
                    response.put("username", actualUser.getUsername());
                    response.put("email", actualUser.getEmail());
                    return response;
                }
            }
            return Collections.singletonMap("error", "unauthorized");
        } catch (AuthenticationException e) {
            return Collections.singletonMap("error", "failed");
        }
    }

    //find userid
    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    // update address kay walay setup address ang register
    public void updateAddress(Long userId, Address address) {
        // Fetch sa database
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // check if nanay address ang user
        Address existingAddress = user.getAddress();

        if (existingAddress != null) {
            // if naay address update ang adress
            existingAddress.setRegion(address.getRegion());
            existingAddress.setProvince(address.getProvince());
            existingAddress.setCity(address.getCity());
            existingAddress.setBarangay(address.getBarangay());
            existingAddress.setPostalCode(address.getPostalCode());
            existingAddress.setStreetBuildingHouseNo(address.getStreetBuildingHouseNo());
        } else {
            // if walay address set address user
            address.setUser(user);
            user.setAddress(address);
        }


        userRepo.save(user);
    }

    // Update user information
    public String updateUser(Long userId, User updatedUser) {
        User existingUser = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // Update username if provided and not already taken
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
            Optional<User> userWithSameUsername = userRepo.findByUsername(updatedUser.getUsername());
            if (userWithSameUsername.isPresent() && !userWithSameUsername.get().getUserId().equals(userId)) {
                return "Username already taken by another user!";
            }
            existingUser.setUsername(updatedUser.getUsername());
        }

        // Update password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // Update email if provided and not already taken
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            Optional<User> userWithSameEmail = userRepo.findByEmail(updatedUser.getEmail());
            if (userWithSameEmail.isPresent() && !userWithSameEmail.get().getUserId().equals(userId)) {
                return "Email already registered by another user!";
            }
            existingUser.setEmail(updatedUser.getEmail());
        }

        // Update first name if provided
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }

        // Update last name if provided
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }

        // Update role if provided
        if (updatedUser.getRole() != null && !updatedUser.getRole().isEmpty()) {
            existingUser.setRole(updatedUser.getRole());
        }

        userRepo.save(existingUser);
        return "User updated successfully!";
    }

    // Delete user (remains the same as before)
    public String deleteUser(Long userId) {
        if (!userRepo.existsById(userId)) {
            throw new EntityNotFoundException("User not found with ID: " + userId);
        }
        userRepo.deleteById(userId);
        return "User deleted successfully!";
    }

}
