package com.awardhub.reports.repository;

import com.awardhub.reports.entity.AnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {
    List<AnalyticsSnapshot> findByMetricName(String metricName);
    List<AnalyticsSnapshot> findByCategoryId(Long categoryId);
}