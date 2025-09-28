package com.expensesplitter.expense_splitter.controller;

import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET all users
    @GetMapping("/users")
    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/signup")
    public User signup(@RequestBody UserDTO dto) {
        // 1. Check if user already exists by email
        Optional<User> existingUserOptional = userRepository.findByEmail(dto.getEmail());

        if (existingUserOptional.isPresent()) {
            // 2. User found (Autologin): Return the existing user object.
            // Since authentication (via Google) is handled externally, we trust the email is verified.
            User existingUser = existingUserOptional.get();

            // Optional: Update the user's name if it changed (e.g., Google profile update)
            existingUser.setName(dto.getName());

            return userRepository.save(existingUser); // Save the updated name/return existing
        }

        // 3. User does NOT exist (Autosignup): Create and save the new user.
        User newUser = new User();
        newUser.setName(dto.getName());
        newUser.setEmail(dto.getEmail());

        // IMPORTANT: Since password field is removed, ensure the User entity's
        // password field is nullable, or set a default/null value here.
        // Assuming your User entity's password field is now removed or nullable.

        return userRepository.save(newUser);
    }

    @GetMapping("/user-info")
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal){
        if (principal == null) {
            // Return an empty map or a specific structure indicating no user is logged in
            // Returning an empty map prevents the NullPointerException.
            return Map.of("error", "User not authenticated");
        }

        // If principal is not null, safely return the attributes
        return principal.getAttributes();
    }

    // DELETE a user
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }


    // DTO for user creation
    public static class UserDTO {
        private String name;
        private String email;
//        private String password;

        // getters & setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

//        public String getPassword() { return password; }
//        public void setPassword(String password) { this.password = password; }


    }


}
