package com.awardhub.nomination.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NominationResponseDTO {

    private Long id;
    private Long nomineeId;
    private Long categoryId;
    private String nominationInformation;
    private String supportingDocument;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
