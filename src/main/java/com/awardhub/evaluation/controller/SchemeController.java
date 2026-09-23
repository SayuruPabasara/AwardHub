package com.awardhub.evaluation.controller;

import com.awardhub.evaluation.model.EvaluationScheme;
import com.awardhub.evaluation.service.SchemeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation/schemes")
public class SchemeController {

    private final SchemeService service;

    public SchemeController(SchemeService service) { this.service = service; }

    @GetMapping
    public List<EvaluationScheme> all() { return service.findAll(); }

    @GetMapping("/{categoryId}")
    public EvaluationScheme byCategory(@PathVariable Long categoryId) {
        return service.findByCategory(categoryId);
    }

    @PostMapping
    public EvaluationScheme save(@Valid @RequestBody EvaluationScheme scheme) {
        return service.save(scheme);
    }

    @PatchMapping("/{categoryId}/lock")
    public EvaluationScheme lock(@PathVariable Long categoryId,
                                 @RequestParam(required = false) Long actorId) {
        return service.lock(categoryId, actorId);
    }
}
