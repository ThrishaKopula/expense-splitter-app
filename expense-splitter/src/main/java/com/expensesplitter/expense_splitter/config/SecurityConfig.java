package com.expensesplitter.expense_splitter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Ensure CORS is enabled globally
                .cors(Customizer.withDefaults())

                // 2. Disable CSRF for API POST requests (important for clients like Axios)
                .csrf(csrf -> csrf.disable())

                // 3. Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Permit ALL access to the custom authentication APIs
                        .requestMatchers("/api/signup", "/api/login", "/api/user-info").permitAll()

                        // 🌟 FIX: Permit access to all expense management APIs 🌟
                        .requestMatchers("/api/expenses/**").permitAll()

                        // Permit access to the OAuth initiation path
                        .requestMatchers("/oauth2/authorization/**").permitAll()

                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )

                // 4. Configure OAuth2 Login
                .oauth2Login(oauth2 -> oauth2
                        // Ensure OAuth success redirects to the frontend dashboard
                        .defaultSuccessUrl("http://localhost:3000/dashboard", true)
                )
                .logout(logout -> logout
                        .logoutUrl("/api/logout") // The URL your frontend will hit
                        .invalidateHttpSession(true) // Clear the session
                        .clearAuthentication(true)   // Clear the authentication
                        .deleteCookies("JSESSIONID", "SESSION") // Delete standard session cookies
                        .logoutSuccessUrl("http://localhost:3000/login") // Redirect back to the frontend login page
                );

        return http.build();
    }
}