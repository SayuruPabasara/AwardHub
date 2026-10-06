package com.awardhub.evaluation.controller;

import com.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.evaluation.dto.JudgeTaskResponse;
import com.awardhub.evaluation.model.Evaluation;
import com.awardhub.evaluation.service.EvaluationService;
import jakarta.validation.Valid;
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
    public List<JudgeTaskResponse> worklist(@PathVariable Long judgeId) {
        return service.worklist(judgeId);
    }

    @GetMapping("/nominations/{nominationId}/judges/{judgeId}")
    public Evaluation one(@PathVariable Long nominationId, @PathVariable Long judgeId) {
        return service.findOne(nominationId, judgeId);
    }

    /** Save a draft (submit=false) or submit a final evaluation (submit=true). */
    @PostMapping("/categories/{categoryId}/evaluations")
    public Evaluation saveOrSubmit(@PathVariable Long categoryId,
                                   @Valid @RequestBody EvaluationRequest request) {
        return service.saveOrSubmit(categoryId, request);
    }

    @GetMapping("/categories/{categoryId}/evaluations")
    public List<Evaluation> submitted(@PathVariable Long categoryId) {
        return service.submittedFor(categoryId);
    }

    @PatchMapping("/evaluations/{id}/verify")
    public Evaluation verify(@PathVariable Long id, @RequestParam(required = false) Long actorId) {
        return service.verify(id, actorId);
    }

    @PatchMapping("/evaluations/{id}/reopen")
    public Evaluation reopen(@PathVariable Long id,
                             @RequestBody(required = false) Map<String, String> body,
                             @RequestParam(required = false) Long actorId) {
        return service.reopen(id, body == null ? null : body.get("reason"), actorId);
    }
}
