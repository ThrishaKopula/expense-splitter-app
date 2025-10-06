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

	@Bean
	CommandLineRunner initializeData(UserRepository userRepository, ExpenseRepository expenseRepository) {
		LocalDateTime today = LocalDateTime.now();
		LocalDateTime yesterday = today.minusDays(1); // Sep 25, 2025
		LocalDateTime lastWeek = today.minusWeeks(1).withHour(10).withMinute(0); // Approx. Sep 19, 2025
		LocalDateTime lastMonth = today.minusMonths(1).withDayOfMonth(15); // Approx. Aug 15, 2025
		LocalDateTime lastYear = today.minusYears(1).withMonth(12).withDayOfMonth(10); // Dec 10, 2024

		return args -> {
			// Create demo users if they don’t exist
			User alice = userRepository.findByEmail("alice@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Alice", "alice@example.com", "password123")
					));

			// Create demo expenses if none exist
			List<Expense> expenses = expenseRepository.findAll();
			if (expenses.isEmpty()) {
				// =======================================================
				// 1. DAILY TEST DATA (Should show only on Sep 26, 2025 filter)
				// =======================================================
				expenseRepository.save(new Expense(
						"Today's Coffee",
						new BigDecimal("5.50"),
						today.minusHours(2), // 2 hours ago
						alice,
						"Food"
				));

				// =======================================================
				// 2. WEEKLY TEST DATA (Should show in DAILY/WEEKLY/MONTHLY/YEARLY)
				// =======================================================
				expenseRepository.save(new Expense(
						"Gas fill-up",
						new BigDecimal("60.00"),
						lastWeek, // Last week's date
						alice,
						"Transportation"
				));

				// =======================================================
				// 3. MONTHLY TEST DATA (Should NOT show in WEEKLY/DAILY)
				// =======================================================
				expenseRepository.save(new Expense(
						"Rent Payment",
						new BigDecimal("1500.00"),
						lastMonth, // Last month's date
						alice,
						"Housing"
				));

				// =======================================================
				// 4. YEARLY TEST DATA (Should only be excluded by YEARLY filter change)
				// =======================================================
				expenseRepository.save(new Expense(
						"Flight to Vegas",
						new BigDecimal("350.00"),
						lastYear, // Last year's date
						alice,
						"Transportation"
				));

				// =======================================================
				// 5. INCOME DATA (Must be correctly counted in totals)
				// =======================================================
				expenseRepository.save(new Expense(
						"Paycheck",
						new BigDecimal("2500.00"),
						yesterday, // Yesterday's date
						alice,
						"Income"
				));
			}

			System.out.println("✅ Users and expenses initialized successfully.");
		};
	}
}
