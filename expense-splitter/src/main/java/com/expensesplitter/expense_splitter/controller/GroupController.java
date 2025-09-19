package com.expensesplitter.expense_splitter.controller;

import com.expensesplitter.expense_splitter.dto.Payment;
import com.expensesplitter.expense_splitter.entity.Expense;
import com.expensesplitter.expense_splitter.entity.Group;
import com.expensesplitter.expense_splitter.entity.User;
import com.expensesplitter.expense_splitter.repository.ExpenseRepository;
import com.expensesplitter.expense_splitter.repository.GroupRepository;
import com.expensesplitter.expense_splitter.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class GroupController {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public GroupController(GroupRepository groupRepository,
                           ExpenseRepository expenseRepository,
                           UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // -------------------- GET ENDPOINTS --------------------

    @GetMapping("/groups")
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @GetMapping("/groups/{id}")
    public Group getGroupById(@PathVariable Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    @GetMapping("/groups/{id}/expenses")
    public List<Expense> getGroupExpenses(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return expenseRepository.findByGroup(group);
    }

    @GetMapping("/groups/{id}/balances")
    public Map<String, BigDecimal> getGroupBalances(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Map<User, BigDecimal> balances = new HashMap<>();
        for (User user : group.getUsers()) {
            balances.put(user, BigDecimal.ZERO);
        }

        for (Expense expense : group.getExpenses()) {
            BigDecimal perUserShare = expense.getAmount()
                    .divide(new BigDecimal(group.getUsers().size()), 2, BigDecimal.ROUND_HALF_UP);
            for (User user : group.getUsers()) {
                if (user.equals(expense.getPaidBy())) {
                    balances.put(user, balances.get(user).add(expense.getAmount().subtract(perUserShare)));
                } else {
                    balances.put(user, balances.get(user).subtract(perUserShare));
                }
            }
        }

        Map<String, BigDecimal> result = new HashMap<>();
        balances.forEach((user, amount) -> result.put(user.getName(), amount));
        return result;
    }

    @GetMapping("/groups/{id}/settle")
    public List<Payment> settleGroup(@PathVariable Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

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

        List<Balance> creditors = new ArrayList<>();
        List<Balance> debtors = new ArrayList<>();
        balances.forEach((user, balance) -> {
            if (balance.compareTo(BigDecimal.ZERO) > 0) creditors.add(new Balance(user, balance));
            else if (balance.compareTo(BigDecimal.ZERO) < 0) debtors.add(new Balance(user, balance.negate()));
        });

        List<Payment> payments = new ArrayList<>();
        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            Balance debtor = debtors.get(i);
            Balance creditor = creditors.get(j);
            BigDecimal amount = debtor.amount.min(creditor.amount);
            payments.add(new Payment(debtor.user.getName(), creditor.user.getName(), amount));

            debtor.amount = debtor.amount.subtract(amount);
            creditor.amount = creditor.amount.subtract(amount);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) i++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) j++;
        }

        return payments;
    }

    // -------------------- POST ENDPOINTS --------------------

    @PostMapping("/groups")
    public Group createGroup(@RequestBody GroupDTO groupDTO) {
        Group group = new Group();
        group.setName(groupDTO.getName());

        Set<User> users = new HashSet<>();
        for (Long userId : groupDTO.getUserIds()) {
            userRepository.findById(userId).ifPresent(users::add);
        }
        group.setUsers(users);

        return groupRepository.save(group);
    }

    @PostMapping("/groups/{groupId}/expenses")
    public Expense createExpense(@PathVariable Long groupId, @RequestBody ExpenseDTO dto) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User payer = userRepository.findById(dto.getPaidByUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setGroup(group);
        expense.setPaidBy(payer);

        return expenseRepository.save(expense);
    }

    // -------------------- DTO CLASSES --------------------

    public static class GroupDTO {
        private String name;
        private Set<Long> userIds;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Set<Long> getUserIds() { return userIds; }
        public void setUserIds(Set<Long> userIds) { this.userIds = userIds; }
    }

    public static class ExpenseDTO {
        private String description;
        private BigDecimal amount;
        private LocalDateTime date;
        private Long paidByUserId;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public Long getPaidByUserId() { return paidByUserId; }
        public void setPaidByUserId(Long paidByUserId) { this.paidByUserId = paidByUserId; }
    }

    // -------------------- HELPER CLASS --------------------

    private static class Balance {
        User user;
        BigDecimal amount;
        Balance(User user, BigDecimal amount) {
            this.user = user;
            this.amount = amount;
        }
    }
}
