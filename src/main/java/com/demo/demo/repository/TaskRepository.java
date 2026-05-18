package com.demo.demo.repository;

import com.demo.demo.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserIdOrderByDueDateAsc(String userId);
    Optional<Task> findByIdAndUserId(String id, String userId);
}
