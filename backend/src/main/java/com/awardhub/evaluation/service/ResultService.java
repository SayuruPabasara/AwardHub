package com.awardhub.evaluation.service;

import com.awardhub.evaluation.dto.EvaluationProgressResponse;
import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.integration.NominationPort;
import com.awardhub.evaluation.integration.VotePort;
import com.awardhub.evaluation.model.*;
import com.awardhub.evaluation.repository.ResultSetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Result calculation, winner determination and controlled publication.
 *
 * Calculation is a snapshot, not a live view. Every number used in a ranking is written into
 * result_entry, and the weights in force at the time are copied onto the result set. A result
 * you can reproduce six months later is the whole point of the module.
 */
@Service
public class ResultService {

    private final ResultSetRepository resultSets;
    private final EvaluationService evaluationService;
    private final SchemeService schemes;
    private final RubricService rubrics;
    private final NominationPort nominations;
    private final VotePort votes;
    private final ScoringEngine engine;
    private final AuditService audit;
    private final JudgeAssignmentService judgeAssignments;

    public ResultService(ResultSetRepository resultSets,
                         EvaluationService evaluationService,
                         SchemeService schemes,
                         RubricService rubrics,
                         NominationPort nominations,
                         VotePort votes,
                         ScoringEngine engine,
                         AuditService audit,
                         JudgeAssignmentService judgeAssignments) {
        this.resultSets = resultSets;
        this.evaluationService = evaluationService;
        this.schemes = schemes;
        this.rubrics = rubrics;
        this.nominations = nominations;
        this.votes = votes;
        this.engine = engine;
        this.audit = audit;
        this.judgeAssignments = judgeAssignments;
    }

    // ---------------- readiness ----------------

    public EvaluationProgressResponse progress(Long categoryId) {
        EvaluationScheme scheme = schemes.findByCategory(categoryId);
        Map<Long, String> approved = nominations.approvedNominations(categoryId);
        int judges = (int) judgeAssignments.activeJudgeCount(categoryId);
        int submitted = evaluationService.submittedFor(categoryId).size();

        EvaluationProgressResponse p = new EvaluationProgressResponse();
        p.setCategoryId(categoryId);
        p.setNominations(approved.size());
        p.setJudges(judges);
        p.setExpectedEvaluations(scheme.getMode() == EvaluationMode.PUBLIC_ONLY ? 0 : approved.size() * judges);
        p.setSubmittedEvaluations(submitted);

        String blocker = null;
        if (approved.isEmpty()) {
            blocker = "No approved nominations in this category.";
        } else if (scheme.getMode() != EvaluationMode.PUBLIC_ONLY && judges == 0) {
            blocker = "No judges are assigned to this category.";
        } else if (scheme.getMode() != EvaluationMode.PUBLIC_ONLY && submitted == 0) {
            blocker = "No judge has submitted an evaluation yet.";
        }
        p.setBlocker(blocker);
        p.setReadyToCalculate(blocker == null);
        return p;
    }

    public ResultSet latest(Long categoryId) {
        return resultSets.findFirstByCategoryIdOrderByVersionNoDesc(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No results have been calculated for category " + categoryId + " yet."));
    }

    public ResultSet published(Long categoryId) {
        return resultSets.findFirstByCategoryIdAndStatusOrderByVersionNoDesc(categoryId, ResultStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Results for category " + categoryId + " have not been published."));
    }

    // ---------------- calculation ----------------

    @Transactional
    public ResultSet calculate(Long categoryId, Long actorId) {
        EvaluationScheme scheme = schemes.findByCategory(categoryId);

        EvaluationProgressResponse readiness = progress(categoryId);
        if (!readiness.isReadyToCalculate()) {
            throw new BusinessRuleException(readiness.getBlocker());
        }

        resultSets.findFirstByCategoryIdOrderByVersionNoDesc(categoryId).ifPresent(existing -> {
            if (existing.getStatus() == ResultStatus.PUBLISHED) {
                throw new BusinessRuleException(
                        "Results for this category are already published. Reopen them before recalculating.");
            }
        });

        Map<Long, String> approved = nominations.approvedNominations(categoryId);

        // ---- judge side ----
        Map<Long, List<BigDecimal>> scoresByNomination = new LinkedHashMap<>();
        Map<Long, List<BigDecimal>> topCriterionRaw = new LinkedHashMap<>();
        Long topCriterionId = highestWeightedCriterionId(categoryId);

        for (Evaluation e : evaluationService.submittedFor(categoryId)) {
            if (!approved.containsKey(e.getNominationId())) continue;   // withdrawn after judging
            scoresByNomination.computeIfAbsent(e.getNominationId(), k -> new ArrayList<>())
                    .add(e.getTotalScore());
            if (topCriterionId != null) {
                for (CriterionScore cs : e.getScores()) {
                    if (topCriterionId.equals(cs.getCriterionId())) {
                        topCriterionRaw.computeIfAbsent(e.getNominationId(), k -> new ArrayList<>())
                                .add(cs.getRawScore());
                    }
                }
            }
        }

        // ---- public side ----
        Map<Long, Long> rawVotes = new LinkedHashMap<>();
        for (Map.Entry<Long, Long> v : votes.voteCounts(categoryId).entrySet()) {
            if (approved.containsKey(v.getKey())) rawVotes.put(v.getKey(), v.getValue());
        }
        for (Long nominationId : approved.keySet()) rawVotes.putIfAbsent(nominationId, 0L);
        Map<Long, BigDecimal> voteScores = engine.normalizeVotes(rawVotes, scheme.getVoteNormalization());

        // ---- combine ----
        List<ScoringEngine.Rankable> rankables = new ArrayList<>();
        Map<Long, ResultEntry> entriesByNomination = new LinkedHashMap<>();
        List<ResultEntry> excluded = new ArrayList<>();

        for (Map.Entry<Long, String> n : approved.entrySet()) {
            Long nominationId = n.getKey();
            List<BigDecimal> judgeScores = scoresByNomination.getOrDefault(nominationId, List.of());

            ResultEntry entry = new ResultEntry();
            entry.setNominationId(nominationId);
            entry.setNomineeName(n.getValue());
            entry.setJudgesCounted(judgeScores.size());
            entry.setVoteCount(rawVotes.getOrDefault(nominationId, 0L));
            entry.setVoteScore(voteScores.get(nominationId));

            boolean needsJudges = scheme.getMode() != EvaluationMode.PUBLIC_ONLY;
            if (needsJudges && judgeScores.size() < scheme.getMinJudgesRequired()) {
                entry.setExcludedReason("Only " + judgeScores.size() + " of the required "
                        + scheme.getMinJudgesRequired() + " judge evaluations were submitted.");
                entry.setRankPosition(0);
                excluded.add(entry);
                continue;
            }

            BigDecimal judgeScore = engine.aggregateJudgeScores(judgeScores, scheme.getAggregationMethod());
            entry.setJudgeScore(judgeScore);
            entry.setFinalScore(engine.combine(judgeScore, entry.getVoteScore(), scheme.getMode(),
                    scheme.getJudgeWeight(), scheme.getPublicWeight()));

            BigDecimal topScore = averageOf(topCriterionRaw.get(nominationId));
            rankables.add(new ScoringEngine.Rankable(nominationId, entry.getFinalScore(),
                    judgeScore, entry.getVoteScore(), topScore));
            entriesByNomination.put(nominationId, entry);
        }

        if (rankables.isEmpty()) {
            throw new BusinessRuleException(
                    "No nominee in this category met the minimum number of judge evaluations.");
        }

        // ---- rank ----
        ResultSet set = new ResultSet();
        set.setCategoryId(categoryId);
        set.setStatus(ResultStatus.CALCULATED);
        set.setCalculatedAt(LocalDateTime.now());
        set.setModeSnapshot(scheme.getMode());
        set.setJudgeWeightSnapshot(scheme.getJudgeWeight());
        set.setPublicWeightSnapshot(scheme.getPublicWeight());
        set.setVersionNo(resultSets.findFirstByCategoryIdOrderByVersionNoDesc(categoryId)
                .map(r -> r.getVersionNo() + 1).orElse(1));

        for (ScoringEngine.Rankable r : engine.rank(rankables)) {
            ResultEntry entry = entriesByNomination.get(r.nominationId);
            entry.setRankPosition(r.rank);
            entry.setWinner(r.winner);
            entry.setTieBreakNote(r.tieBreakNote);
            set.addEntry(entry);
        }
        for (ResultEntry e : excluded) set.addEntry(e);

        ResultSet saved = resultSets.save(set);
        audit.record(actorId, "RESULTS_CALCULATED", "ResultSet", saved.getId(),
                "categoryId=" + categoryId + " version=" + saved.getVersionNo()
                        + " ranked=" + rankables.size() + " excluded=" + excluded.size());
        return saved;
    }

    private BigDecimal averageOf(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return null;
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal v : values) sum = sum.add(v);
        return sum.divide(BigDecimal.valueOf(values.size()), ScoringEngine.SCALE, ScoringEngine.ROUNDING);
    }

    private Long highestWeightedCriterionId(Long categoryId) {
        try {
            Rubric rubric = rubrics.activeFor(categoryId);
            RubricCriterion top = null;
            for (RubricCriterion c : rubric.getCriteria()) {
                if (top == null || c.getWeight().compareTo(top.getWeight()) > 0) top = c;
            }
            return top == null ? null : top.getId();
        } catch (ResourceNotFoundException ex) {
            return null;   // public-only categories have no rubric
        }
    }

    // ---------------- publication workflow ----------------

    @Transactional
    public ResultSet submitForApproval(Long categoryId, Long actorId) {
        ResultSet set = latest(categoryId);
        if (set.getStatus() != ResultStatus.CALCULATED) {
            throw new BusinessRuleException("Only calculated results can be sent for approval.");
        }
        set.setStatus(ResultStatus.PENDING_APPROVAL);
        audit.record(actorId, "RESULTS_SENT_FOR_APPROVAL", "ResultSet", set.getId(), null);
        return resultSets.save(set);
    }

    /**
     * Publication is the point of no return, so it refuses on an unresolved tie.
     * Announcing two winners because the software could not choose is worse than a delay.
     */
    @Transactional
    public ResultSet publish(Long categoryId, Long organizerId, String note) {
        ResultSet set = latest(categoryId);
        if (set.getStatus() == ResultStatus.PUBLISHED) {
            throw new BusinessRuleException("These results are already published.");
        }
        if (set.getStatus() != ResultStatus.PENDING_APPROVAL && set.getStatus() != ResultStatus.CALCULATED) {
            throw new BusinessRuleException("Results must be calculated before they can be published.");
        }
        boolean unresolvedTie = set.getEntries().stream()
                .anyMatch(e -> e.getTieBreakNote() != null && e.getTieBreakNote().startsWith("Unresolved tie"));
        if (unresolvedTie) {
            throw new BusinessRuleException(
                    "There is an unresolved tie at the top of this category. Record a manual decision before publishing.");
        }

        set.setStatus(ResultStatus.PUBLISHED);
        set.setPublishedAt(LocalDateTime.now());
        set.setPublishedBy(organizerId);
        audit.record(organizerId, "RESULTS_PUBLISHED", "ResultSet", set.getId(),
                "categoryId=" + categoryId + " " + (note == null ? "" : note));
        return resultSets.save(set);
    }

    /** Re-opens a published result set so it can be recalculated. The reason is mandatory. */
    @Transactional
    public ResultSet reopen(Long categoryId, String reason, Long actorId) {
        if (reason == null || reason.isBlank()) {
            throw new BusinessRuleException("A reason is required before published results can be reopened.");
        }
        ResultSet set = latest(categoryId);
        if (set.getStatus() != ResultStatus.PUBLISHED) {
            throw new BusinessRuleException("Only published results can be reopened.");
        }
        set.setStatus(ResultStatus.CALCULATED);
        set.setRecalculationReason(reason);
        audit.record(actorId, "RESULTS_REOPENED", "ResultSet", set.getId(), reason);
        return resultSets.save(set);
    }

    /** Organizer's manual decision on a tie the cascade could not separate. */
    @Transactional
    public ResultSet resolveTieManually(Long categoryId, Long winningNominationId, String reason, Long actorId) {
        ResultSet set = latest(categoryId);
        if (set.getStatus() == ResultStatus.PUBLISHED) {
            throw new BusinessRuleException("Reopen the results before changing a tie decision.");
        }
        boolean found = false;
        for (ResultEntry e : set.getEntries()) {
            if (e.getNominationId().equals(winningNominationId)) {
                e.setWinner(true);
                e.setTieBreakNote("Tie resolved by organizer decision: " + reason);
                found = true;
            } else if (e.getRankPosition() == 1) {
                e.setWinner(false);
                e.setRankPosition(2);
                e.setTieBreakNote("Tie resolved by organizer decision in favour of nomination "
                        + winningNominationId + ".");
            }
        }
        if (!found) {
            throw new ResourceNotFoundException("Nomination " + winningNominationId + " is not in this result set.");
        }
        audit.record(actorId, "TIE_RESOLVED_MANUALLY", "ResultSet", set.getId(),
                "winner=" + winningNominationId + " reason=" + reason);
        return resultSets.save(set);
    }
}
