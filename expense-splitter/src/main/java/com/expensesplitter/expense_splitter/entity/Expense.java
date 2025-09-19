package com.expensesplitter.expense_splitter.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private BigDecimal amount;
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "paid_by_user_id")
    private User paidBy;

    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonBackReference // <-- Prevent infinite loop when serializing Group
    private Group group;



    public Expense() {}

    public Expense(String description, BigDecimal amount, LocalDateTime date, User paidBy, Group group) {
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.paidBy = paidBy;
        this.group = group;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public User getPaidBy() { return paidBy; }
    public void setPaidBy(User paidBy) { this.paidBy = paidBy; }

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }
}
