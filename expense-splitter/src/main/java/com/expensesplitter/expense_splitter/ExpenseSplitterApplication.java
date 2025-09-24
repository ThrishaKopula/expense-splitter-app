package com.expensesplitter.expense_splitter;

import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import com.expensesplitter.expense_splitter.repository.ExpenseRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class ExpenseSplitterApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseSplitterApplication.class, args);
	}

	// ✅ Seed demo data at startup
	@Bean
	CommandLineRunner initializeData(UserRepository userRepository, ExpenseRepository expenseRepository) {
		return args -> {
			// Create demo users if they don’t exist
			User alice = userRepository.findByEmail("alice@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Alice", "alice@example.com", "password123")
					));

			User bob = userRepository.findByEmail("bob@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Bob", "bob@example.com", "password456")
					));

			// Create demo expenses if none exist
			List<Expense> expenses = expenseRepository.findAll();
			if (expenses.isEmpty()) {
				expenseRepository.save(new Expense(
						"Groceries",
						new BigDecimal("120.50"),
						LocalDateTime.now(),
						alice,
						"food"
				));

				expenseRepository.save(new Expense(
						"Electricity Bill",
						new BigDecimal("80.00"),
						LocalDateTime.now(),
						alice,
						"bills"
				));

				expenseRepository.save(new Expense(
						"Netflix Subscription",
						new BigDecimal("15.99"),
						LocalDateTime.now(),
						bob,
						"subscriptions"
				));
			}

			System.out.println("✅ Users and expenses initialized successfully.");
		};
	}
}
