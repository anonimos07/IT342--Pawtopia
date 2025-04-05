package com.example.pawtopia.pawtopia.ecommerce.Service;


import com.example.pawtopia.pawtopia.ecommerce.Entity.Admin;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.AdminRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@Primary
public class CustomerUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;
    private final AdminRepo adminRepo;

    private final ThreadLocal<String> authType = new ThreadLocal<>();

    public CustomerUserDetailsService(UserRepo userRepo, AdminRepo adminRepo) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;

    }

    public void setAuthType(String type) {
        this.authType.set(type);
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String currentAuthType = authType.get();

        if ("ADMIN".equals(currentAuthType)) {
            Admin admin = adminRepo.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));

            return new org.springframework.security.core.userdetails.User(
                    admin.getUsername(),
                    admin.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority(admin.getRole()))
            );
        } else {
            // Default to USER auth type
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
        }
    }

//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        User user = userRepo.findByUsername(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
//
//        return new org.springframework.security.core.userdetails.User(
//                user.getUsername(),
//                user.getPassword(),
//                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
//        );
//    }
}
