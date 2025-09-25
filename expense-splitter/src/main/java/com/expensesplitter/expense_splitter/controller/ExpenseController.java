package com.expensesplitter.expense_splitter.controller;

import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.repository.ExpenseRepository;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // Get all expenses for a specific user
    @GetMapping("/{userId}")
    public List<Expense> getExpensesByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findByUser(user);
    }

    // Add expense
    @PostMapping("/{userId}")
    public Expense addExpense(@PathVariable Long userId, @RequestBody ExpenseDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense(
                dto.getDescription(),
                dto.getAmount(),
                dto.getDate() != null ? dto.getDate() : LocalDateTime.now(),
                user,
                dto.getCategory()
        );

        return expenseRepository.save(expense);
    }

    // 🌟 NEW: Update Expense Endpoint 🌟
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO dto) {
        // 1. Find the existing expense by ID
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));

        // 2. Update all editable fields from the DTO

        // Update description: The DTO description can be null or a string.
        // We update the entity field directly.
        existingExpense.setDescription(dto.getDescription());

        // Update amount: BigDecimal must be non-null.
        if (dto.getAmount() != null) {
            existingExpense.setAmount(dto.getAmount());
        }

        // Update date: LocalDateTime must be non-null.
        // The frontend always sends a date, but we ensure it's not null before updating.
        if (dto.getDate() != null) {
            existingExpense.setDate(dto.getDate());
        }

        // Update category: The frontend always sends a category.
        existingExpense.setCategory(dto.getCategory());

        // We do NOT update the User ID, as this expense still belongs to the same user.

        // 3. Save the updated entity back to the database
        return expenseRepository.save(existingExpense);
    }
    // 🌟 END NEW 🌟

    // Delete expense
    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(expense);
    }

    // DTO for creating an expense
    public static class ExpenseDTO {
        private String description;
        private BigDecimal amount;
        private LocalDateTime date;
        private String category;

        // Getters & setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
