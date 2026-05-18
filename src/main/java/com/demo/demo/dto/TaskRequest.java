package com.demo.demo.dto;

import java.time.LocalDate;

public record TaskRequest(String title, String description, LocalDate dueDate, Boolean completed) {}
