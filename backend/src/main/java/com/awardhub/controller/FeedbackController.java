package com.awardhub.controller;

import com.awardhub.dto.DTOs.FeedbackDto;
import com.awardhub.dto.DTOs.FeedbackRequest;
import com.awardhub.security.CurrentUser;
import com.awardhub.service.FeedbackService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FeedbackController {

    private final FeedbackService feedback;

    public FeedbackController(FeedbackService feedback) {
        this.feedback = feedback;
    }

    @PostMapping("/api/feedback")
    public FeedbackDto submit(@RequestBody FeedbackRequest body) {
        return feedback.submit(CurrentUser.get(), body);
    }

    @GetMapping("/api/my/feedback")
    public List<FeedbackDto> mine() {
        return feedback.mine(CurrentUser.get());
    }
}
