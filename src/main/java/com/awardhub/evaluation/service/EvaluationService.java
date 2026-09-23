package com.awardhub.evaluation.service;

import com.awardhub.evaluation.dto.CriterionScoreRequest;
import com.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.evaluation.dto.JudgeTaskResponse;
import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.integration.NominationPort;
import com.awardhub.evaluation.model.*;
import com.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.evaluation.repository.JudgeAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Judging: what a judge sees, what a judge may submit, and when the window closes.
 * Blind review is enforced here, in the service, not in the React component - a UI-only
 * mask is defeated by opening the network tab.
 */
@Service
public class EvaluationService {

    private static final List<EvaluationStatus> COUNTED =
            List.of(EvaluationStatus.SUBMITTED, EvaluationStatus.VERIFIED, EvaluationStatus.LOCKED);

    private final EvaluationRepository evaluations;
    private final JudgeAssignmentRepository assignments;
    private final RubricService rubrics;
    private final SchemeService schemes;
    private final NominationPort nominations;
    private final ScoringEngine engine;
    private final AuditService audit;
    private final JudgeAssignmentService assignmentService;

    public EvaluationService(EvaluationRepository evaluations,
                             JudgeAssignmentRepository assignments,
                             RubricService rubrics,
                             SchemeService schemes,
                             NominationPort nominations,
                             ScoringEngine engine,
                             AuditService audit,
                             JudgeAssignmentService assignmentService) {
        this.evaluations = evaluations;
        this.assignments = assignments;
        this.rubrics = rubrics;
        this.schemes = schemes;
        this.nominations = nominations;
        this.engine = engine;
        this.audit = audit;
        this.assignmentService = assignmentService;
    }

    public static List<EvaluationStatus> countedStatuses() { return COUNTED; }

    // ---------------- judge worklist ----------------

    /** Every approved nomination in the categories this judge is assigned to, with progress. */
    public List<JudgeTaskResponse> worklist(Long judgeId) {
        List<JudgeTaskResponse> tasks = new ArrayList<>();

        for (JudgeAssignment a : assignments.findByJudgeIdAndStatusNot(judgeId, AssignmentStatus.REVOKED)) {
            EvaluationScheme scheme = schemes.findByCategory(a.getCategoryId());
            Map<Long, String> approved = nominations.approvedNominations(a.getCategoryId());

            int index = 0;
            for (Map.Entry<Long, String> n : approved.entrySet()) {
                index++;
                JudgeTaskResponse t = new JudgeTaskResponse();
                t.setNominationId(n.getKey());
                t.setCategoryId(a.getCategoryId());
                t.setCategoryName(scheme.getCategoryName());
                t.setDisplayName(scheme.isBlindReview() ? maskedName(index) : n.getValue());

                Optional<Evaluation> existing = evaluations.findByNominationIdAndJudgeId(n.getKey(), judgeId);
                t.setStatus(existing.map(Evaluation::getStatus).orElse(null));
                t.setEvaluationId(existing.map(Evaluation::getId).orElse(null));
                // A judge never sees their own numeric score until they have submitted it,
                // and never sees another judge's score at all.
                t.setTotalScore(existing.filter(e -> e.getStatus() != EvaluationStatus.DRAFT)
                        .map(Evaluation::getTotalScore).orElse(null));
                tasks.add(t);
            }
        }
        return tasks;
    }

    private String maskedName(int index) {
        // Nominee A, Nominee B ... Nominee Z, then Nominee AA
        StringBuilder sb = new StringBuilder();
        int n = index;
        while (n > 0) {
            int rem = (n - 1) % 26;
            sb.insert(0, (char) ('A' + rem));
            n = (n - 1) / 26;
        }
        return "Nominee " + sb;
    }

    public Evaluation findOne(Long nominationId, Long judgeId) {
        return evaluations.findByNominationIdAndJudgeId(nominationId, judgeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No evaluation yet for nomination " + nominationId + " by judge " + judgeId + "."));
    }

    // ---------------- scoring ----------------

    /**
     * Saves a draft or submits a final evaluation.
     *
     * Rules enforced, in order:
     *  - the judge is actually assigned to the nomination's category
     *  - the evaluation window is open
     *  - a SUBMITTED evaluation cannot be silently overwritten
     *  - every criterion in the active rubric has a score, inside the rubric scale
     */
    @Transactional
    public Evaluation saveOrSubmit(Long categoryId, EvaluationRequest request) {

        JudgeAssignment assignment = assignments
                .findByCategoryIdAndJudgeId(categoryId, request.getJudgeId())
                .orElseThrow(() -> new BusinessRuleException(
                        "You are not assigned as a judge for this category."));
        if (assignment.getStatus() == AssignmentStatus.REVOKED) {
            throw new BusinessRuleException("This judging assignment has been revoked.");
        }

        EvaluationScheme scheme = schemes.findByCategory(categoryId);
        if (scheme.getMode() == EvaluationMode.PUBLIC_ONLY) {
            throw new BusinessRuleException("This category is decided by public vote only.");
        }
        requireWindowOpen(scheme);

        Map<Long, String> approved = nominations.approvedNominations(categoryId);
        if (!approved.containsKey(request.getNominationId())) {
            throw new BusinessRuleException(
                    "Nomination " + request.getNominationId() + " is not an approved nomination in this category.");
        }

        Rubric rubric = rubrics.activeFor(categoryId);

        Evaluation evaluation = evaluations
                .findByNominationIdAndJudgeId(request.getNominationId(), request.getJudgeId())
                .orElseGet(Evaluation::new);

        if (evaluation.getId() != null && evaluation.getStatus() != EvaluationStatus.DRAFT) {
            throw new BusinessRuleException(
                    "This evaluation has already been submitted. Ask the organizer to reopen it if a change is needed.");
        }

        evaluation.setNominationId(request.getNominationId());
        evaluation.setCategoryId(categoryId);
        evaluation.setJudgeId(request.getJudgeId());
        evaluation.setRubricId(rubric.getId());
        evaluation.setComments(request.getComments());
        evaluation.setUpdatedAt(LocalDateTime.now());

        evaluation.getScores().clear();
        Map<Long, BigDecimal> raw = new LinkedHashMap<>();
        Set<Long> validCriteria = new HashSet<>();
        for (RubricCriterion c : rubric.getCriteria()) validCriteria.add(c.getId());

        for (CriterionScoreRequest s : request.getScores()) {
            if (!validCriteria.contains(s.getCriterionId())) {
                throw new BusinessRuleException(
                        "Criterion " + s.getCriterionId() + " does not belong to the active rubric.");
            }
            CriterionScore cs = new CriterionScore();
            cs.setCriterionId(s.getCriterionId());
            cs.setRawScore(s.getRawScore());
            cs.setNote(s.getNote());
            evaluation.addScore(cs);
            raw.put(s.getCriterionId(), s.getRawScore());
        }

        if (request.isSubmit()) {
            Map<Long, BigDecimal> weights = new LinkedHashMap<>();
            for (RubricCriterion c : rubric.getCriteria()) weights.put(c.getId(), c.getWeight());

            BigDecimal total = engine.judgeScore(raw, weights, rubric.getScaleMin(), rubric.getScaleMax());
            evaluation.setTotalScore(total);
            evaluation.setStatus(EvaluationStatus.SUBMITTED);
            evaluation.setSubmittedAt(LocalDateTime.now());
        } else {
            evaluation.setStatus(EvaluationStatus.DRAFT);
        }

        Evaluation saved = evaluations.save(evaluation);
        assignmentService.markInProgress(categoryId, request.getJudgeId());
        audit.record(request.getJudgeId(),
                request.isSubmit() ? "EVALUATION_SUBMITTED" : "EVALUATION_DRAFT_SAVED",
                "Evaluation", saved.getId(),
                "nominationId=" + saved.getNominationId()
                        + (request.isSubmit() ? " score=" + saved.getTotalScore() : ""));
        return saved;
    }

    private void requireWindowOpen(EvaluationScheme scheme) {
        LocalDateTime now = LocalDateTime.now();
        if (scheme.getEvaluationOpensAt() != null && now.isBefore(scheme.getEvaluationOpensAt())) {
            throw new BusinessRuleException("Judging for this category has not opened yet.");
        }
        if (scheme.getEvaluationClosesAt() != null && now.isAfter(scheme.getEvaluationClosesAt())) {
            throw new BusinessRuleException("The judging deadline for this category has passed.");
        }
    }

    /** Organizer action: allows one submitted evaluation to be edited again, and says why. */
    @Transactional
    public Evaluation reopen(Long evaluationId, String reason, Long actorId) {
        Evaluation e = evaluations.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation", evaluationId));
        if (e.getStatus() == EvaluationStatus.LOCKED) {
            throw new BusinessRuleException("Locked evaluations cannot be reopened; recalculate the results instead.");
        }
        e.setStatus(EvaluationStatus.DRAFT);
        e.setSubmittedAt(null);
        audit.record(actorId, "EVALUATION_REOPENED", "Evaluation", evaluationId, reason);
        return evaluations.save(e);
    }

    /** Organizer action: marks a submitted evaluation as reviewed and accepted. */
    @Transactional
    public Evaluation verify(Long evaluationId, Long actorId) {
        Evaluation e = evaluations.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation", evaluationId));
        if (e.getStatus() != EvaluationStatus.SUBMITTED) {
            throw new BusinessRuleException("Only submitted evaluations can be verified.");
        }
        e.setStatus(EvaluationStatus.VERIFIED);
        audit.record(actorId, "EVALUATION_VERIFIED", "Evaluation", evaluationId, null);
        return evaluations.save(e);
    }

    public List<Evaluation> submittedFor(Long categoryId) {
        return evaluations.findByCategoryIdAndStatusIn(categoryId, COUNTED);
    }
}
