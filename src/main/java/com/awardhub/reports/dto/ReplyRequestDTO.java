package com.awardhub.reports.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReplyRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "Reply message is required")
    @Size(max = 2000, message = "Reply must not exceed 2000 characters")
    private String message;
}