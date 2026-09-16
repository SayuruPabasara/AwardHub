package com.awardhub.reports.dto;

import com.awardhub.common.enums.ReportFormat;
import com.awardhub.common.enums.ReportType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReportRequestDTO {

    @NotNull(message = "Report type is required")
    private ReportType reportType;

    private Long categoryId;

    @Size(max = 10000, message = "Content must not exceed 10000 characters")
    private String content;

    @NotBlank(message = "generatedBy is required")
    private String generatedBy;

    private ReportFormat format;
}