package com.expensesplitter.expense_splitter.controller;

import com.expensesplitter.expense_splitter.dto.Payment;
import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.entity.Group;
import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.repository.ExpenseRepository;
import com.expensesplitter.expense_splitter.repository.GroupRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GroupController {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;

    public GroupController(GroupRepository groupRepository, ExpenseRepository expenseRepository) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
    }

    // GET all groups
    @GetMapping("/groups")
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    // GET group by ID
    @GetMapping("/{id}")
    public Group getGroupById(@PathVariable Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    @GetMapping("/groups/{id}/expenses")
    public List<Expense> getGroupExpenses(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return expenseRepository.findByGroup(group);
    }


    @GetMapping("groups/{id}/balances")
    public Map<String, BigDecimal> getGroupBalances(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Map<User, BigDecimal> balances = new HashMap<>();

        // Initialize all users’ balances to 0
        for (User user : group.getUsers()) {
            balances.put(user, BigDecimal.ZERO);
        }

        // Sum expenses
        for (Expense expense : group.getExpenses()) {
            BigDecimal perUserShare = expense.getAmount()
                    .divide(new BigDecimal(group.getUsers().size()), 2, BigDecimal.ROUND_HALF_UP);

            for (User user : group.getUsers()) {
                if (user.equals(expense.getPaidBy())) {
                    // The payer gets credit for what they paid minus their own share
                    balances.put(user, balances.get(user).add(expense.getAmount().subtract(perUserShare)));
                } else {
                    // Other users owe their share
                    balances.put(user, balances.get(user).subtract(perUserShare));
                }
            }
        }

        // Convert User keys to names/email for JSON
        Map<String, BigDecimal> result = new HashMap<>();
        balances.forEach((user, amount) -> result.put(user.getName(), amount));

        return result;
    }

    @GetMapping("groups/{id}/settle")
    public List<Payment> settleGroup(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Calculate balances (same as before)
        Map<User, BigDecimal> balances = new HashMap<>();
        for (User user : group.getUsers()) {
            balances.put(user, BigDecimal.ZERO);
        }

        for (Expense expense : group.getExpenses()) {
            BigDecimal perUser = expense.getAmount()
                    .divide(new BigDecimal(group.getUsers().size()), 2, BigDecimal.ROUND_HALF_UP);
            for (User user : group.getUsers()) {
                if (user.equals(expense.getPaidBy())) {
                    balances.put(user, balances.get(user).add(expense.getAmount().subtract(perUser)));
                } else {
                    balances.put(user, balances.get(user).subtract(perUser));
                }
            }
        }

        // Split users into creditors and debtors
        List<Balance> creditors = new ArrayList<>();
        List<Balance> debtors = new ArrayList<>();

        balances.forEach((user, balance) -> {
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new Balance(user, balance));
            } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new Balance(user, balance.negate())); // make positive
            }
        });

        List<Payment> payments = new ArrayList<>();
        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            Balance debtor = debtors.get(i);
            Balance creditor = creditors.get(j);

            BigDecimal amount = debtor.amount.min(creditor.amount);
            payments.add(new Payment(debtor.user.getName(), creditor.user.getName(), amount));

            // Subtract the amount
            debtor.amount = debtor.amount.subtract(amount);
            creditor.amount = creditor.amount.subtract(amount);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) i++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) j++;
        }


        return payments;
    }

    private static class Balance {
        User user;
        BigDecimal amount;

        Balance(User user, BigDecimal amount) {
            this.user = user;
            this.amount = amount;
        }
    }


}
