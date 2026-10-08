package com.awardhub.reports.entity;

import com.awardhub.common.enums.ReportFormat;
import com.awardhub.common.enums.ReportType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType reportType;

    private Long categoryId;

    @Column(length = 10000)
    private String content;

    @Column(nullable = false)
    private String generatedBy;

    @Enumerated(EnumType.STRING)
    private ReportFormat format;

    @Column(nullable = false)
    private Boolean archived = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.archived == null) this.archived = false;
    }
}