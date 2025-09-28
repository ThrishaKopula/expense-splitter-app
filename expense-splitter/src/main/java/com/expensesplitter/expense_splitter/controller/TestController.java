package com.expensesplitter.expense_splitter.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/")
    public String greet(){
        return "Welcome!";
    }
}
