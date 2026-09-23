package com.awardhub.evaluation.controller;

import com.awardhub.evaluation.dto.EvaluationProgressResponse;
import com.awardhub.evaluation.dto.PublishRequest;
import com.awardhub.evaluation.model.EvaluationAuditLog;
import com.awardhub.evaluation.model.ResultSet;
import com.awardhub.evaluation.service.AuditService;
import com.awardhub.evaluation.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation/results")
public class ResultController {

    private final ResultService service;
    private final AuditService audit;

    public ResultController(ResultService service, AuditService audit) {
        this.service = service;
        this.audit = audit;
    }

    @GetMapping("/{categoryId}/progress")
    public EvaluationProgressResponse progress(@PathVariable Long categoryId) {
        return service.progress(categoryId);
    }

    @GetMapping("/{categoryId}")
    public ResultSet latest(@PathVariable Long categoryId) { return service.latest(categoryId); }

    /** Public endpoint: only ever returns a published result set. */
    @GetMapping("/{categoryId}/published")
    public ResultSet published(@PathVariable Long categoryId) { return service.published(categoryId); }

    @PostMapping("/{categoryId}/calculate")
    public ResultSet calculate(@PathVariable Long categoryId,
                               @RequestParam(required = false) Long actorId) {
        return service.calculate(categoryId, actorId);
    }

    @PostMapping("/{categoryId}/submit-for-approval")
    public ResultSet submitForApproval(@PathVariable Long categoryId,
                                       @RequestParam(required = false) Long actorId) {
        return service.submitForApproval(categoryId, actorId);
    }

    @PostMapping("/{categoryId}/publish")
    public ResultSet publish(@PathVariable Long categoryId, @Valid @RequestBody PublishRequest request) {
        return service.publish(categoryId, request.getOrganizerId(), request.getNote());
    }

    @PostMapping("/{categoryId}/reopen")
    public ResultSet reopen(@PathVariable Long categoryId,
                            @RequestBody Map<String, String> body,
                            @RequestParam(required = false) Long actorId) {
        return service.reopen(categoryId, body.get("reason"), actorId);
    }

    @PostMapping("/{categoryId}/resolve-tie")
    public ResultSet resolveTie(@PathVariable Long categoryId,
                                @RequestBody Map<String, String> body,
                                @RequestParam(required = false) Long actorId) {
        Long winner = Long.valueOf(body.get("winningNominationId"));
        return service.resolveTieManually(categoryId, winner, body.get("reason"), actorId);
    }

    @GetMapping("/audit/recent")
    public List<EvaluationAuditLog> auditTrail() { return audit.recent(); }
}
