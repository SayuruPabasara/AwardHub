package com.awardhub.reports.controller;

import com.awardhub.common.enums.ReportType;
import com.awardhub.common.enums.Role;
import com.awardhub.common.response.ApiResponse;
import com.awardhub.reports.dto.ReportRequestDTO;
import com.awardhub.reports.dto.ReportResponseDTO;
import com.awardhub.reports.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponseDTO>> generate(@Valid @RequestBody ReportRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Report generated",
                reportService.generate(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponseDTO>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", reportService.getAll()));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<ReportResponseDTO>>> getByType(@PathVariable ReportType type) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", reportService.getByType(type)));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<ReportResponseDTO>>> getForRole(@PathVariable Role role) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", reportService.getForRole(role)));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<ReportResponseDTO>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Report archived",
                reportService.archive(id)));
    }
}