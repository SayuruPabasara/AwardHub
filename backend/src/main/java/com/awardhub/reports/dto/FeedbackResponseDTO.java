package com.awardhub.reports.dto;

import com.awardhub.common.enums.FeedbackStatus;
import com.awardhub.common.enums.FeedbackType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedbackResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String subject;
    private String message;
    private FeedbackType feedbackType;
    private FeedbackStatus status;
    private Integer rating;
    private Long categoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ReplyResponseDTO> replies;
}