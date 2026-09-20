package com.awardhub.reports.controller;

import com.awardhub.common.response.ApiResponse;
import com.awardhub.reports.dto.ReplyRequestDTO;
import com.awardhub.reports.dto.ReplyResponseDTO;
import com.awardhub.reports.service.FeedbackReplyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/feedback/{feedbackId}/replies")
public class FeedbackReplyController {

    private final FeedbackReplyService replyService;

    public FeedbackReplyController(FeedbackReplyService replyService) {
        this.replyService = replyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReplyResponseDTO>> addReply(@PathVariable Long feedbackId,
                                                                  @Valid @RequestBody ReplyRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Reply added",
                replyService.addReply(feedbackId, dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReplyResponseDTO>>> getReplies(@PathVariable Long feedbackId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK",
                replyService.getReplies(feedbackId)));
    }
}