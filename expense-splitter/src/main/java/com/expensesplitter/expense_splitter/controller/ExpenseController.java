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
