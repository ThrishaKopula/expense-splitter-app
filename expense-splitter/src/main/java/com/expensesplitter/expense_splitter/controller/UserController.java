package com.expensesplitter.expense_splitter.controller;

import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

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

    // POST create new user
    @PostMapping("/users")
    public User createUser(@RequestBody UserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // For demo purposes, store plain text (resume project)
        return userRepository.save(user);
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
        private String password;

        // getters & setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
