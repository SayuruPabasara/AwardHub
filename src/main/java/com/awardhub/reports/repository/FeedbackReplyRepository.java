package com.awardhub.reports.repository;

import com.awardhub.reports.entity.FeedbackReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackReplyRepository extends JpaRepository<FeedbackReply, Long> {
    List<FeedbackReply> findByFeedbackIdOrderByRepliedAtAsc(Long feedbackId);
}