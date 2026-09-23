package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.EvaluationMode;
import com.awardhub.evaluation.model.EvaluationScheme;
import com.awardhub.evaluation.repository.EvaluationSchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SchemeService {

    private final EvaluationSchemeRepository repository;
    private final ScoringEngine engine;
    private final AuditService audit;

    public SchemeService(EvaluationSchemeRepository repository, ScoringEngine engine, AuditService audit) {
        this.repository = repository;
        this.engine = engine;
        this.audit = audit;
    }

    public List<EvaluationScheme> findAll() { return repository.findAll(); }

    public EvaluationScheme findByCategory(Long categoryId) {
        return repository.findByCategoryId(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No evaluation scheme is configured for category " + categoryId + "."));
    }

    @Transactional
    public EvaluationScheme save(EvaluationScheme scheme) {
        if (scheme.getMode() == EvaluationMode.HYBRID) {
            engine.requireWeightsSumToOne(List.of(scheme.getJudgeWeight(), scheme.getPublicWeight()));
        } else if (scheme.getMode() == EvaluationMode.JUDGE_ONLY) {
            scheme.setJudgeWeight(BigDecimal.ONE);
            scheme.setPublicWeight(BigDecimal.ZERO);
        } else {
            scheme.setJudgeWeight(BigDecimal.ZERO);
            scheme.setPublicWeight(BigDecimal.ONE);
        }

        repository.findByCategoryId(scheme.getCategoryId()).ifPresent(existing -> {
            if (existing.isLocked() && !existing.getId().equals(scheme.getId())) {
                throw new BusinessRuleException(
                        "The evaluation scheme for this category is locked and cannot be changed.");
            }
            scheme.setId(existing.getId());
        });

        EvaluationScheme saved = repository.save(scheme);
        audit.record(null, "SCHEME_SAVED", "EvaluationScheme", saved.getId(),
                "mode=" + saved.getMode() + " judgeWeight=" + saved.getJudgeWeight());
        return saved;
    }

    /** Locking is what makes the "rules cannot change mid-cycle" constraint real rather than a promise. */
    @Transactional
    public EvaluationScheme lock(Long categoryId, Long actorId) {
        EvaluationScheme scheme = findByCategory(categoryId);
        scheme.setLocked(true);
        audit.record(actorId, "SCHEME_LOCKED", "EvaluationScheme", scheme.getId(), null);
        return repository.save(scheme);
    }
}
