package com.expensesplitter.expense_splitter.repository;

import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Optional<Expense> findByDescriptionAndGroup(String description, Group group);
    List<Expense> findByGroup(Group group);

}
