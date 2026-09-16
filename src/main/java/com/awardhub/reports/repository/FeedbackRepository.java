package com.awardhub.reports.repository;

import com.awardhub.common.enums.FeedbackStatus;
import com.awardhub.reports.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserId(Long userId);
    List<Feedback> findByStatus(FeedbackStatus status);
    List<Feedback> findByCategoryId(Long categoryId);
}