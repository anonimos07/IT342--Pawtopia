package com.example.pawtopia.pawtopia.ecommerce.Config;

import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecConfig {

    private final UserDetailsService userDetailsService;
    private final UserDetailsService adminUserDetailsService;

    @Autowired
    @Lazy
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Autowired
    @Lazy
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS requests for all endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Your existing permissions
                        .requestMatchers("/users/signup", "/users/login", "/admin/login",
                                "/api/product/getProduct","/api/product/getProduct/{id}","/api/review/**").permitAll()
                        .requestMatchers("/users/**","/appointments/postAppointment",
                                "/adresses/get-users/{userId}","/adresses/del-users/{userId}","/api/cartItem/**","/api/cart/**",
                                "/api/order/postOrderRecord","/api/order/putOrderDetails","/api/order/deleteOrderDetails/{id}").hasRole("CUSTOMER")
                        .requestMatchers("/admin/**","/adresses/getAllAddress",
                                "/appointments/confirm/{appid}","/appointments/getAppointment",
                                "/api/product/putProduct/{id}","/api/product/deleteProduct/{id}","/api/product/getTotalQuantitySold",
                                "/api/order/getAllOrders","/api/order/getOrderDetails/{orderID}","/api/order/getAllOrdersByUserId",
                                "/api/order/get-total-income").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2login -> oauth2login
                        .successHandler(oAuth2SuccessHandler))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Add this method to configure CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Allow your frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allow all needed methods
        configuration.setAllowedHeaders(Arrays.asList("*")); // Allow all headers (including Authorization)
        configuration.setAllowCredentials(true); // Allow cookies/auth headers
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all paths
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)throws Exception{
        return authenticationConfiguration.getAuthenticationManager();

    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

