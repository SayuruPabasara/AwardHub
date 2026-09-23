package com.awardhub.evaluation.controller;

import com.awardhub.evaluation.model.JudgeAssignment;
import com.awardhub.evaluation.service.JudgeAssignmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation/assignments")
public class JudgeAssignmentController {

    private final JudgeAssignmentService service;

    public JudgeAssignmentController(JudgeAssignmentService service) { this.service = service; }

    @GetMapping("/category/{categoryId}")
    public List<JudgeAssignment> byCategory(@PathVariable Long categoryId) {
        return service.forCategory(categoryId);
    }

    @GetMapping("/judge/{judgeId}")
    public List<JudgeAssignment> byJudge(@PathVariable Long judgeId) {
        return service.forJudge(judgeId);
    }

    @PostMapping
    public JudgeAssignment assign(@RequestBody JudgeAssignment assignment,
                                  @RequestParam(required = false) Long actorId) {
        return service.assign(assignment, actorId);
    }

    @PatchMapping("/{id}/revoke")
    public JudgeAssignment revoke(@PathVariable Long id,
                                  @RequestBody(required = false) Map<String, String> body,
                                  @RequestParam(required = false) Long actorId) {
        String reason = body == null ? null : body.get("reason");
        return service.revoke(id, reason, actorId);
    }
}
