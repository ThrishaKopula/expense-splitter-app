package com.expensesplitter.expense_splitter.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class TestEntity {
    @Id
    private Long id;
    private String name;

    // Default constructor (required by JPA)
    public TestEntity() {}

    // Constructor for convenience
    public TestEntity(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
