package com.awardhub.reports.dto;

import com.awardhub.common.enums.FeedbackType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "Subject is required")
    @Size(max = 150, message = "Subject must not exceed 150 characters")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    @NotNull(message = "Feedback type is required")
    private FeedbackType feedbackType;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private Long categoryId;
}