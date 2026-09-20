package com.awardhub.reports.controller;

import com.awardhub.common.response.ApiResponse;
import com.awardhub.reports.entity.AnalyticsSnapshot;
import com.awardhub.reports.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AnalyticsSnapshot>> record(@RequestBody AnalyticsSnapshot snapshot) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Recorded",
                analyticsService.record(snapshot)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnalyticsSnapshot>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", analyticsService.getAll()));
    }

    @GetMapping("/metric/{metricName}")
    public ResponseEntity<ApiResponse<List<AnalyticsSnapshot>>> getByMetric(@PathVariable String metricName) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK",
                analyticsService.getByMetric(metricName)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<AnalyticsSnapshot>>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK",
                analyticsService.getByCategory(categoryId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        analyticsService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }
}