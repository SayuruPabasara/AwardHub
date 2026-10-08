package com.awardhub.evaluation.controller;

import com.awardhub.common.enums.Role;
import com.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.evaluation.dto.JudgeTaskResponse;
import com.awardhub.evaluation.model.Evaluation;
import com.awardhub.evaluation.service.EvaluationService;
import com.awardhub.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation")
public class EvaluationController {

    private final EvaluationService service;

    public EvaluationController(EvaluationService service) { this.service = service; }

    /** The judge's worklist. Nominee names are already masked when blind review is on. */
    @GetMapping("/judges/{judgeId}/worklist")
    @PreAuthorize("hasAnyRole('JUDGE', 'ADMIN', 'ORGANIZER')")
    public List<JudgeTaskResponse> worklist(@PathVariable Long judgeId,
                                           @AuthenticationPrincipal User me) {
        if (me != null && me.getRole() == Role.JUDGE && !me.getId().equals(judgeId)) {
            throw new AccessDeniedException("Judges can only access their own evaluation worklist.");
        }
        return service.worklist(judgeId);
    }

    @GetMapping("/nominations/{nominationId}/judges/{judgeId}")
    @PreAuthorize("hasAnyRole('JUDGE', 'ADMIN', 'ORGANIZER')")
    public Evaluation one(@PathVariable Long nominationId,
                          @PathVariable Long judgeId,
                          @AuthenticationPrincipal User me) {
        if (me != null && me.getRole() == Role.JUDGE && !me.getId().equals(judgeId)) {
            throw new AccessDeniedException("Judges can only access their own evaluations.");
        }
        return service.findOne(nominationId, judgeId);
    }

    /** Save a draft (submit=false) or submit a final evaluation (submit=true). */
    @PostMapping("/categories/{categoryId}/evaluations")
    @PreAuthorize("hasAnyRole('JUDGE', 'ADMIN', 'ORGANIZER')")
    public Evaluation saveOrSubmit(@PathVariable Long categoryId,
                                   @Valid @RequestBody EvaluationRequest request,
                                   @AuthenticationPrincipal User me) {
        if (me != null && me.getRole() == Role.JUDGE) {
            request.setJudgeId(me.getId());
        }
        return service.saveOrSubmit(categoryId, request);
    }

    @GetMapping("/categories/{categoryId}/evaluations")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public List<Evaluation> submitted(@PathVariable Long categoryId) {
        return service.submittedFor(categoryId);
    }

    @PatchMapping("/evaluations/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public Evaluation verify(@PathVariable Long id,
                             @RequestParam(required = false) Long actorId,
                             @AuthenticationPrincipal User me) {
        Long actualActor = me != null ? me.getId() : actorId;
        return service.verify(id, actualActor);
    }

    @PatchMapping("/evaluations/{id}/reopen")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public Evaluation reopen(@PathVariable Long id,
                             @RequestBody(required = false) Map<String, String> body,
                             @RequestParam(required = false) Long actorId,
                             @AuthenticationPrincipal User me) {
        Long actualActor = me != null ? me.getId() : actorId;
        return service.reopen(id, body == null ? null : body.get("reason"), actualActor);
    }
}
