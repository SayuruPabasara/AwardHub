package com.awardhub.evaluation.controller;

import com.awardhub.evaluation.model.Rubric;
import com.awardhub.evaluation.service.RubricService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation/rubrics")
public class RubricController {

    private final RubricService service;

    public RubricController(RubricService service) { this.service = service; }

    @GetMapping("/{categoryId}/active")
    public Rubric active(@PathVariable Long categoryId) { return service.activeFor(categoryId); }

    @GetMapping("/{categoryId}/history")
    public List<Rubric> history(@PathVariable Long categoryId) { return service.history(categoryId); }

    /** Publishes a new rubric version for the category carried in the body. */
    @PostMapping
    public Rubric publish(@RequestBody Rubric rubric,
                          @RequestParam(required = false) Long actorId) {
        return service.publishVersion(rubric, actorId);
    }
}
