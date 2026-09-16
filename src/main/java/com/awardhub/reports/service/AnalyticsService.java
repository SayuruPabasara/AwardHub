package com.awardhub.reports.service;

import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.reports.entity.AnalyticsSnapshot;
import com.awardhub.reports.repository.AnalyticsSnapshotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private final AnalyticsSnapshotRepository analyticsRepository;

    public AnalyticsService(AnalyticsSnapshotRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public AnalyticsSnapshot record(AnalyticsSnapshot snapshot) {
        return analyticsRepository.save(snapshot);
    }

    public List<AnalyticsSnapshot> getAll() {
        return analyticsRepository.findAll();
    }

    public List<AnalyticsSnapshot> getByMetric(String metricName) {
        return analyticsRepository.findByMetricName(metricName);
    }

    public List<AnalyticsSnapshot> getByCategory(Long categoryId) {
        return analyticsRepository.findByCategoryId(categoryId);
    }

    public void delete(Long id) {
        if (!analyticsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Snapshot not found");
        }
        analyticsRepository.deleteById(id);
    }
}