package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Admin;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.AdminRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    @Autowired
    private AdminRepo adminRepo;
    @Autowired
    private UserRepo userRepo;

    @Value("${jwt.secret}")
    private String secretKey;
//    private String secretkey = "";

//    public JwtService(){
//        try {
//            KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
//            SecretKey sk = keyGenerator.generateKey();
//            secretkey = Base64.getEncoder().encodeToString(sk.getEncoded());
//        } catch (NoSuchAlgorithmException e) {
//            throw new RuntimeException(e);
//        }
//    }

    private Key getKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();

        //added try catch and bool can be removed
        boolean isAdmin = false;
        try {
            // Try to find admin first
            Optional<Admin> admin = adminRepo.findByUsername(username);
            if (admin.isPresent()) {
                isAdmin = true;
                claims.put("role", "ROLE_ADMIN");
            } else {
                // If not admin, must be customer
                Optional<User> user = userRepo.findByUsername(username);
                if (user.isPresent()) {
                    claims.put("role", "ROLE_CUSTOMER");
                }
            }
        } catch (Exception e) {
            // Log error
            System.out.println("Error determining user role: " + e.getMessage());
        }

        return Jwts.builder()
                .setClaims(claims)
                .addClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
                .signWith(getKey())
                .compact();

    }

    //for google
    public String generateToken(String username, Map<String, Object> externalClaims) {
        Map<String, Object> claims = new HashMap<>(externalClaims);

        //added try catch and bool can be removed
        boolean isAdmin = false;
        try {
            // Try to find admin first
            Optional<Admin> admin = adminRepo.findByUsername(username);
            if (admin.isPresent()) {
                isAdmin = true;
                claims.put("role", "ROLE_ADMIN");
            } else {
                // If not admin, must be customer
                Optional<User> user = userRepo.findByUsername(username);
                if (user.isPresent()) {
                    claims.put("role", "ROLE_CUSTOMER");
                }
            }
        } catch (Exception e) {
            // Log error
            System.out.println("Error determining user role: " + e.getMessage());
        }

        return Jwts.builder()
                .setClaims(claims)
                .addClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
                .signWith(getKey())
                .compact();

    }
    //added can be removed
    public String extractRole(String token) {
        return extractClaims(token, claims -> claims.get("role", String.class));
    }



//    private Key getKey(){
//        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
//        return Keys.hmacShaKeyFor(keyBytes);
//    }

    public String extractUserName(String token){
        return extractClaims(token, Claims::getSubject);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimResolver){
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build().parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));

    }

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token){
        return extractClaims(token, Claims::getExpiration);
    }
}
