package com.awardhub.reports.controller;

import com.awardhub.common.enums.FeedbackStatus;
import com.awardhub.common.response.ApiResponse;
import com.awardhub.reports.dto.FeedbackRequestDTO;
import com.awardhub.reports.dto.FeedbackResponseDTO;
import com.awardhub.reports.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponseDTO>> submit(@Valid @RequestBody FeedbackRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Feedback submitted",
                feedbackService.submit(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeedbackResponseDTO>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", feedbackService.getAll()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDTO>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", feedbackService.getByUser(userId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDTO>>> getByStatus(@PathVariable FeedbackStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", feedbackService.getByStatus(status)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FeedbackResponseDTO>> updateStatus(@PathVariable Long id,
                                                                         @RequestParam FeedbackStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated",
                feedbackService.updateStatus(id, status)));
    }
}