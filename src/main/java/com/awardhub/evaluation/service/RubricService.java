package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.Rubric;
import com.awardhub.evaluation.model.RubricCriterion;
import com.awardhub.evaluation.repository.RubricRepository;
import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryCriterion;
import com.awardhub.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RubricService {

    private final RubricRepository repository;
    private final ScoringEngine engine;
    private final AuditService audit;
    private final CategoryRepository categoryRepository;

    public RubricService(RubricRepository repository,
                         ScoringEngine engine,
                         AuditService audit,
                         CategoryRepository categoryRepository) {
        this.repository = repository;
        this.engine = engine;
        this.audit = audit;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Rubric activeFor(Long categoryId) {
        return repository.findByCategoryIdAndActiveTrue(categoryId)
                .orElseGet(() -> autoCreateDefaultRubric(categoryId));
    }

    private Rubric autoCreateDefaultRubric(Long categoryId) {
        Category cat = categoryRepository.findById(categoryId).orElse(null);
        Rubric rubric = new Rubric();
        rubric.setCategoryId(categoryId);
        rubric.setName((cat != null ? cat.getName() : "Category #" + categoryId) + " Evaluation Rubric");
        rubric.setVersion(1);
        rubric.setScaleMin(1);
        rubric.setScaleMax(100);
        rubric.setActive(true);

        if (cat != null && cat.getCriteria() != null && !cat.getCriteria().isEmpty()) {
            List<CategoryCriterion> catCriteria = cat.getCriteria();
            BigDecimal totalWeight = catCriteria.stream()
                    .map(CategoryCriterion::getWeight)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal allocated = BigDecimal.ZERO;
            for (int i = 0; i < catCriteria.size(); i++) {
                CategoryCriterion cc = catCriteria.get(i);
                RubricCriterion rc = new RubricCriterion();
                rc.setName(cc.getCriterionName());
                rc.setDescription(cc.getDescription());
                rc.setDisplayOrder(i + 1);

                BigDecimal w;
                if (i == catCriteria.size() - 1) {
                    w = BigDecimal.ONE.subtract(allocated);
                } else if (totalWeight.compareTo(BigDecimal.ZERO) > 0 && cc.getWeight() != null) {
                    w = cc.getWeight().divide(totalWeight, 4, RoundingMode.HALF_UP);
                    allocated = allocated.add(w);
                } else {
                    w = BigDecimal.ONE.divide(BigDecimal.valueOf(catCriteria.size()), 4, RoundingMode.HALF_UP);
                    allocated = allocated.add(w);
                }
                rc.setWeight(w);
                rubric.addCriterion(rc);
            }
        } else {
            RubricCriterion c1 = new RubricCriterion();
            c1.setName("Technical & Creative Innovation");
            c1.setDescription("Originality, technical ingenuity, and novelty of the submission.");
            c1.setWeight(new BigDecimal("0.3500"));
            c1.setDisplayOrder(1);
            rubric.addCriterion(c1);

            RubricCriterion c2 = new RubricCriterion();
            c2.setName("Quantifiable Impact & Scalability");
            c2.setDescription("Measurable value delivered to target audience and future growth potential.");
            c2.setWeight(new BigDecimal("0.3500"));
            c2.setDisplayOrder(2);
            rubric.addCriterion(c2);

            RubricCriterion c3 = new RubricCriterion();
            c3.setName("Execution & Presentation Quality");
            c3.setDescription("Soundness of methodology, architecture, and quality of dossier evidence.");
            c3.setWeight(new BigDecimal("0.3000"));
            c3.setDisplayOrder(3);
            rubric.addCriterion(c3);
        }

        Rubric saved = repository.save(rubric);
        audit.record(null, "RUBRIC_AUTO_INITIALIZED", "Rubric", saved.getId(),
                "criteriaCount=" + saved.getCriteria().size() + " categoryId=" + categoryId);
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
