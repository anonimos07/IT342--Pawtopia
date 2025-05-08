package com.example.pawtopia.pawtopia.ecommerce.Config;

import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import kong.unirest.Unirest;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/",
                                "/users/signup",
                                "/users/login",
                                "/admin/login",
                                "/api/product/getProduct",
                                "/api/product/getProduct/{id}",
                                "/api/review/**",
                                "/oauth-success",
                                "/oauth2/authorization/google",
                                "/login/oauth2/code/google"
                        ).permitAll()
                        // Allow authenticated users to access their own profile
                        .requestMatchers("/users/me").authenticated()
                        // Customer-specific endpoints
                        .requestMatchers(
                                "/users/user/{id}",  // Keep this for admin use
                                "/appointments/postAppointment",
                                "/appointments/byUserEmail/{email}",
                                "/adresses/get-users/{userId}",
                                "/adresses/del-users/{userId}",
                                "/api/cartItem/**",
                                "/api/cart/**",
                                "/api/order/postOrderRecord",
                                "/api/order/test",
                                "/api/order/getOrderDetails/{orderID}",
                                "/api/order/putOrderDetails",
                                "/api/order/deleteOrderDetails/{id}",
                                "/api/orderItem/test",
                                "/api/orderItem/postOrderItemRecord",
                                "/api/orderItem/putOrderItemDetails",
                                "/api/order/getAllOrdersByUserId",
                                "/api/payment/create-payment-link/{orderId}",
                                "/api/payment/verify/{orderId}",
                                "/api/review/**"

                        ).hasRole("CUSTOMER")
                        // Admin-specific endpoints
                        .requestMatchers(
                                "/admin/**",
                                "/adresses/getAllAddress",
                                "/appointments/confirm/{appId}",
                                "/appointments/cancel/{appId}",
                                "/appointments/deleteAppointment/{appId}",
                                "/appointments/getAppointment",
                                "/api/product/putProduct/{id}",
                                "/api/product/deleteProduct/{id}",
                                "/api/product/getTotalQuantitySold",
                                "/api/order/getAllOrders",
                                "/api/order/getOrderDetails/{orderID}",
                                "/api/order/get-total-income",
                                "/api/orderItem/getAllOrdersItem",
                                "/api/orderItem/putOrderItemDetails",
                                "/api/orderItem/deleteOrderItemDetails/{id}",
                                "/users/all"
                        ).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
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
//        configuration.setAllowedOrigins(Arrays.asList("https://it-342-pawtopia-snct.vercel.app"));
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService); // You might need a custom UserDetailsService that handles both regular users and admins
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

    @PostConstruct
    public void initUnirest() {
        Unirest.config()
                .connectTimeout(5000)
                .socketTimeout(5000)
                .defaultBaseUrl("https://api.paymongo.com");
    }
}

