package com.demo.demo.controller;

import com.demo.demo.dto.TaskRequest;
import com.demo.demo.entity.Task;
import com.demo.demo.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> listTasks(Authentication authentication) {
        return taskService.listTasks(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(Authentication authentication, @RequestBody TaskRequest request) {
        return taskService.createTask(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody TaskRequest request) {
        return taskService.updateTask(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(Authentication authentication, @PathVariable String id) {
        taskService.deleteTask(authentication.getName(), id);
    }
}
