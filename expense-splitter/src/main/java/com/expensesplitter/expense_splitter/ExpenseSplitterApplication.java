package com.expensesplitter.expense_splitter;

import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.entity.Group;
import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import com.expensesplitter.expense_splitter.repository.GroupRepository;
import com.expensesplitter.expense_splitter.repository.ExpenseRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class ExpenseSplitterApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseSplitterApplication.class, args);
	}

	@Bean
	CommandLineRunner initializeData(
			UserRepository userRepository,
			GroupRepository groupRepository,
			ExpenseRepository expenseRepository
	) {
		return args -> {

			// 1️⃣ Create users if they don’t exist
			User alice = userRepository.findByEmail("alice@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Alice", "alice@example.com", "password123")
					));

			User bob = userRepository.findByEmail("bob@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Bob", "bob@example.com", "password456")
					));

			User charlie = userRepository.findByEmail("charlie@example.com")
					.orElseGet(() -> userRepository.save(
							new User("Charlie", "charlie@example.com", "password789")
					));

			// 2️⃣ Create group if it doesn’t exist and add users
			Group roommates = groupRepository.findByName("Roommates")
					.orElseGet(() -> {
						Group g = new Group("Roommates");
						g.addUser(alice);
						g.addUser(bob);
						g.addUser(charlie);
						return groupRepository.save(g);
					});

			System.out.println("Group saved: " + roommates.getName() +
					" with users: " + roommates.getUsers().size());

			// 3️⃣ Add multiple expenses if they don’t exist
			expenseRepository.findByDescriptionAndGroup("Groceries", roommates)
					.orElseGet(() -> expenseRepository.save(
							new Expense(
									"Groceries",
									new BigDecimal("90.00"),
									LocalDateTime.now(),
									alice,
									roommates
							)
					));

			expenseRepository.findByDescriptionAndGroup("Utilities", roommates)
					.orElseGet(() -> expenseRepository.save(
							new Expense(
									"Utilities",
									new BigDecimal("150.00"),
									LocalDateTime.now(),
									bob,
									roommates
							)
					));

			expenseRepository.findByDescriptionAndGroup("Internet", roommates)
					.orElseGet(() -> expenseRepository.save(
							new Expense(
									"Internet",
									new BigDecimal("60.00"),
									LocalDateTime.now(),
									charlie,
									roommates
							)
					));

			System.out.println("Expenses checked/created successfully.");
		};
	}
}

