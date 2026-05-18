package com.demo.demo.service;

import com.demo.demo.dto.TaskRequest;
import com.demo.demo.entity.Task;
import com.demo.demo.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> listTasks(String userId) {
        return taskRepository.findByUserIdOrderByDueDateAsc(userId);
    }

    public Task createTask(String userId, TaskRequest request) {
        validateTitle(request.title());
        Task task = new Task();
        task.setUserId(userId);
        task.setTitle(request.title().trim());
        task.setDescription(trimOrNull(request.description()));
        task.setDueDate(request.dueDate());
        task.setCompleted(false);
        return taskRepository.save(task);
    }

    public Task updateTask(String userId, String taskId, TaskRequest request) {
        Task task = findOwnedTask(userId, taskId);
        if (request.title() != null) {
            validateTitle(request.title());
            task.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            task.setDescription(trimOrNull(request.description()));
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.completed() != null) {
            task.setCompleted(request.completed());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(String userId, String taskId) {
        taskRepository.delete(findOwnedTask(userId, taskId));
    }

    private Task findOwnedTask(String userId, String taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("任务不存在"));
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("任务标题不能为空");
        }
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
