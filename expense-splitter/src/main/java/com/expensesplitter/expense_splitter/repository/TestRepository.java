package com.expensesplitter.expense_splitter.repository;

import com.expensesplitter.expense_splitter.entity.TestEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<TestEntity, Long> {}