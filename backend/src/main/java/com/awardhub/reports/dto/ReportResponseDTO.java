package com.awardhub.reports.dto;

import com.awardhub.common.enums.ReportFormat;
import com.awardhub.common.enums.ReportType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportResponseDTO {
    private Long id;
    private ReportType reportType;
    private Long categoryId;
    private String content;
    private String generatedBy;
    private ReportFormat format;
    private Boolean archived;
    private LocalDateTime createdAt;
}