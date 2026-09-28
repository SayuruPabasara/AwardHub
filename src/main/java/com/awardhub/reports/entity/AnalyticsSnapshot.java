package com.awardhub.reports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "analytics_snapshot")
public class AnalyticsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String metricName;

    @Column(nullable = false)
    private Double metricValue;

    private Long categoryId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime capturedAt;

    @PrePersist
    public void onCreate() {
        this.capturedAt = LocalDateTime.now();
    }
}