package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.Rubric;
import com.awardhub.evaluation.model.RubricCriterion;
import com.awardhub.evaluation.repository.RubricRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RubricService {

    private final RubricRepository repository;
    private final ScoringEngine engine;
    private final AuditService audit;

    public RubricService(RubricRepository repository, ScoringEngine engine, AuditService audit) {
        this.repository = repository;
        this.engine = engine;
        this.audit = audit;
    }

    public Rubric activeFor(Long categoryId) {
        return repository.findByCategoryIdAndActiveTrue(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active rubric for category " + categoryId + "."));
    }

    public List<Rubric> history(Long categoryId) {
        return repository.findByCategoryIdOrderByVersionDesc(categoryId);
    }

    /**
     * Publishing a rubric creates a new version and deactivates the previous one rather than
     * editing in place. Scores already submitted keep pointing at the version they were given
     * under, so an old evaluation never silently changes meaning.
     */
    @Transactional
    public Rubric publishVersion(Rubric incoming, Long actorId) {
        List<BigDecimal> weights = incoming.getCriteria().stream()
                .map(RubricCriterion::getWeight).collect(Collectors.toList());
        if (weights.isEmpty()) {
            throw new BusinessRuleException("A rubric needs at least one criterion.");
        }
        engine.requireWeightsSumToOne(weights);
        if (incoming.getScaleMax() <= incoming.getScaleMin()) {
            throw new BusinessRuleException("Scale maximum must be greater than the minimum.");
        }

        List<Rubric> existing = repository.findByCategoryIdOrderByVersionDesc(incoming.getCategoryId());
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersion() + 1;
        for (Rubric r : existing) {
            r.setActive(false);
        }
        repository.saveAll(existing);

        Rubric fresh = new Rubric();
        fresh.setCategoryId(incoming.getCategoryId());
        fresh.setName(incoming.getName());
        fresh.setScaleMin(incoming.getScaleMin());
        fresh.setScaleMax(incoming.getScaleMax());
        fresh.setVersion(nextVersion);
        fresh.setActive(true);
        fresh.setCriteria(new ArrayList<>());

        int order = 0;
        for (RubricCriterion c : incoming.getCriteria()) {
            RubricCriterion copy = new RubricCriterion();
            copy.setName(c.getName());
            copy.setDescription(c.getDescription());
            copy.setWeight(c.getWeight());
            copy.setDisplayOrder(order++);
            fresh.addCriterion(copy);
        }

        Rubric saved = repository.save(fresh);
        audit.record(actorId, "RUBRIC_PUBLISHED", "Rubric", saved.getId(),
                "version=" + saved.getVersion() + " criteria=" + saved.getCriteria().size());
        return saved;
    }
}
