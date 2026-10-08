package com.awardhub.evaluation.service;

import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryCriterion;
import com.awardhub.category.repository.CategoryCriterionRepository;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.Rubric;
import com.awardhub.evaluation.model.RubricCriterion;
import com.awardhub.evaluation.repository.RubricRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RubricService {

    private final RubricRepository repository;
    private final ScoringEngine engine;
    private final AuditService audit;
    private final CategoryCriterionRepository categoryCriterionRepository;
    private final CategoryRepository categoryRepository;

    public RubricService(RubricRepository repository,
                         ScoringEngine engine,
                         AuditService audit,
                         CategoryCriterionRepository categoryCriterionRepository,
                         CategoryRepository categoryRepository) {
        this.repository = repository;
        this.engine = engine;
        this.audit = audit;
        this.categoryCriterionRepository = categoryCriterionRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Rubric activeFor(Long categoryId) {
        return repository.findByCategoryIdAndActiveTrue(categoryId)
                .orElseGet(() -> bridgeFromCategoryCriteria(categoryId));
    }

    private Rubric bridgeFromCategoryCriteria(Long categoryId) {
        List<CategoryCriterion> ccList = categoryCriterionRepository.findByCategoryId(categoryId);
        if (ccList == null || ccList.isEmpty()) {
            throw new ResourceNotFoundException("No active rubric or criteria found for category " + categoryId + ".");
        }

        String catName = categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("Category " + categoryId);

        Rubric rubric = new Rubric();
        rubric.setCategoryId(categoryId);
        rubric.setName(catName + " Rubric");
        rubric.setScaleMin(1);
        rubric.setScaleMax(10);
        rubric.setVersion(1);
        rubric.setActive(true);
        rubric.setCriteria(new ArrayList<>());

        int order = 0;
        BigDecimal totalWeight = BigDecimal.ZERO;
        for (CategoryCriterion cc : ccList) {
            BigDecimal rawWeight = cc.getWeight();
            BigDecimal normalizedWeight = (rawWeight != null && rawWeight.compareTo(BigDecimal.ONE) > 0)
                    ? rawWeight.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                    : (rawWeight != null ? rawWeight : BigDecimal.ZERO);
            totalWeight = totalWeight.add(normalizedWeight);

            RubricCriterion rc = new RubricCriterion();
            rc.setName(cc.getCriterionName());
            rc.setDescription(cc.getDescription());
            rc.setWeight(normalizedWeight);
            rc.setDisplayOrder(order++);
            rubric.addCriterion(rc);
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0 || totalWeight.subtract(BigDecimal.ONE).abs().compareTo(new BigDecimal("0.01")) > 0) {
            BigDecimal equalWeight = BigDecimal.ONE.divide(BigDecimal.valueOf(rubric.getCriteria().size()), 4, RoundingMode.HALF_UP);
            for (RubricCriterion rc : rubric.getCriteria()) {
                rc.setWeight(equalWeight);
            }
        }

        Rubric saved = repository.save(rubric);
        audit.record(1L, "RUBRIC_AUTO_BRIDGED", "Rubric", saved.getId(),
                "Bridged " + saved.getCriteria().size() + " criteria from category definitions");
        return saved;
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
