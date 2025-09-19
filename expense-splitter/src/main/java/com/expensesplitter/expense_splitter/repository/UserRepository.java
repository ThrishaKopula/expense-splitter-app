package com.expensesplitter.expense_splitter.repository;

import com.expensesplitter.expense_splitter.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

