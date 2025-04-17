package com.example.pawtopia.pawtopia.ecommerce.Config;

import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2SuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService; // Assuming you have a service to handle user data

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        Map<String, Object> additionalClaims = new HashMap<>();
        additionalClaims.put("name", name);
        additionalClaims.put("auth_provider", "oauth2");

        // Generate JWT token google
        String token = jwtUtil.generateTokenForOAuth2User(email, additionalClaims);

        // response header
        response.setHeader("Authorization", "Bearer " + token);

        // Option 1: Set as non-HttpOnly cookie so JavaScript can read it
        Cookie cookie = new Cookie("jwt_token", token);
        cookie.setHttpOnly(false); // Allow JavaScript to read the cookie
        cookie.setSecure(request.isSecure()); // true for HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(3600); // 1 hour in seconds
        response.addCookie(cookie);

        // Option 2: Also provide token in URL (as backup)
        getRedirectStrategy().sendRedirect(request, response,
                "http://localhost:5173/oauth-success?token=" + token);
    }
}