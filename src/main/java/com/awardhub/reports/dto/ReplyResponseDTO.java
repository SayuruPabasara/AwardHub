package com.awardhub.reports.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReplyResponseDTO {
    private Long id;
    private Long repliedById;
    private String repliedByName;
    private String message;
    private LocalDateTime repliedAt;
}