package com.expensesplitter.expense_splitter.dto;

import java.math.BigDecimal;

public class Payment {
    private String from;
    private String to;
    private BigDecimal amount;

    public Payment(String from, String to, BigDecimal amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public BigDecimal getAmount() { return amount; }

    public void setFrom(String from) { this.from = from; }
    public void setTo(String to) { this.to = to; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
