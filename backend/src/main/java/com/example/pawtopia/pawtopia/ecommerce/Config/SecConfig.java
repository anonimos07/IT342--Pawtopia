package com.example.pawtopia.pawtopia.ecommerce.Config;

import com.example.pawtopia.pawtopia.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
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
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/users/signup", "/users/login", "/admin/login").permitAll()
                        .requestMatchers("/users/**","/appointments/postAppointment").hasRole("CUSTOMER")
                        .requestMatchers("/admin/**","/adresses/getAllAddress",
                                "/appointments/confirm/{appid}","/appointments/getAppointment").hasRole("ADMIN")
//                        .requestMatchers("/adresses/getAllAddress").hasAuthority("ADMIN")
                        .anyRequest().authenticated()
                )
                //uncomment if mag gamit na sa frontend
                .oauth2Login(oauth2login -> oauth2login
                        .successHandler(oAuth2SuccessHandler))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        ;
        return http.build();
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
