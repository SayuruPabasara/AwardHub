package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.model.AggregationMethod;
import com.awardhub.evaluation.model.EvaluationMode;
import com.awardhub.evaluation.model.VoteNormalization;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * The calculation core of Module 5.
 *
 * Deliberately free of JPA and Spring Data so every rule can be unit tested in isolation
 * (see ScoringEngineTest). Nothing here touches the database.
 *
 * All public scores are on a 0-100 scale, rounded to 4 decimal places with HALF_UP,
 * so two nominees are only "tied" when they are genuinely tied, not because of
 * floating point noise.
 */
@Component
public class ScoringEngine {

    public static final int SCALE = 4;
    public static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    // ------------------------------------------------------------------
    // Step 1: one judge, one nominee -> a single 0-100 score
    // ------------------------------------------------------------------

    /**
     * Weighted score for a single evaluation.
     *
     * finalRaw = sum(rawScore_c * weight_c)   (weights sum to 1, so finalRaw stays on the rubric scale)
     * score    = (finalRaw - scaleMin) / (scaleMax - scaleMin) * 100
     *
     * The min-max step matters: on a 1-10 rubric a nominee who scores 1 everywhere should
     * get 0, not 10. Skipping it quietly compresses the whole ranking.
     */
    public BigDecimal judgeScore(Map<Long, BigDecimal> rawScores,
                                 Map<Long, BigDecimal> criterionWeights,
                                 int scaleMin, int scaleMax) {

        if (criterionWeights == null || criterionWeights.isEmpty()) {
            throw new BusinessRuleException("Rubric has no criteria.");
        }
        if (scaleMax <= scaleMin) {
            throw new BusinessRuleException("Rubric scale is invalid: max must be greater than min.");
        }
        requireWeightsSumToOne(criterionWeights.values());

        BigDecimal weighted = BigDecimal.ZERO;
        for (Map.Entry<Long, BigDecimal> e : criterionWeights.entrySet()) {
            BigDecimal raw = rawScores.get(e.getKey());
            if (raw == null) {
                throw new BusinessRuleException("Missing score for criterion " + e.getKey() + ".");
            }
            if (raw.compareTo(BigDecimal.valueOf(scaleMin)) < 0
                    || raw.compareTo(BigDecimal.valueOf(scaleMax)) > 0) {
                throw new BusinessRuleException(
                        "Score " + raw + " is outside the rubric scale " + scaleMin + "-" + scaleMax + ".");
            }
            weighted = weighted.add(raw.multiply(e.getValue()));
        }

        BigDecimal span = BigDecimal.valueOf(scaleMax - scaleMin);
        return weighted.subtract(BigDecimal.valueOf(scaleMin))
                .divide(span, 10, ROUNDING)
                .multiply(HUNDRED)
                .setScale(SCALE, ROUNDING);
    }

    // ------------------------------------------------------------------
    // Step 2: several judges -> one judge score for the nominee
    // ------------------------------------------------------------------

    /**
     * TRIMMED_MEAN needs at least 5 judges to be meaningful - dropping the top and bottom
     * of three scores leaves a single judge deciding the award. Below 5 it falls back to MEAN.
     */
    public BigDecimal aggregateJudgeScores(List<BigDecimal> scores, AggregationMethod method) {
        if (scores == null || scores.isEmpty()) {
            return null;
        }
        List<BigDecimal> sorted = new ArrayList<>(scores);
        Collections.sort(sorted);

        switch (method) {
            case MEDIAN:
                return median(sorted);
            case TRIMMED_MEAN:
                if (sorted.size() >= 5) {
                    return mean(sorted.subList(1, sorted.size() - 1));
                }
                return mean(sorted);
            case MEAN:
            default:
                return mean(sorted);
        }
    }

    private BigDecimal mean(List<BigDecimal> values) {
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal v : values) sum = sum.add(v);
        return sum.divide(BigDecimal.valueOf(values.size()), SCALE, ROUNDING);
    }

    private BigDecimal median(List<BigDecimal> sorted) {
        int n = sorted.size();
        if (n % 2 == 1) {
            return sorted.get(n / 2).setScale(SCALE, ROUNDING);
        }
        return sorted.get(n / 2 - 1).add(sorted.get(n / 2))
                .divide(BigDecimal.valueOf(2), SCALE, ROUNDING);
    }

    // ------------------------------------------------------------------
    // Step 3: raw vote counts -> a comparable 0-100 score
    // ------------------------------------------------------------------

    /**
     * Votes and judge scores live on different scales - 847 votes cannot be added to 82.3
     * points. Normalisation happens inside the category, never across categories, because a
     * popular category naturally attracts more votes than a niche one.
     *
     * MAX_IN_CATEGORY  : leader = 100, others are a proportion of the leader.
     * SHARE_OF_TOTAL   : nominee votes / all votes in the category * 100, so the scores
     *                    across a category sum to 100 and a crowded field scores lower.
     */
    public Map<Long, BigDecimal> normalizeVotes(Map<Long, Long> votesByNomination,
                                                VoteNormalization strategy) {
        Map<Long, BigDecimal> out = new LinkedHashMap<>();
        if (votesByNomination == null || votesByNomination.isEmpty()) {
            return out;
        }

        long max = 0L;
        long total = 0L;
        for (Long v : votesByNomination.values()) {
            long safe = v == null ? 0L : v;
            max = Math.max(max, safe);
            total += safe;
        }

        long denominator = (strategy == VoteNormalization.SHARE_OF_TOTAL) ? total : max;

        for (Map.Entry<Long, Long> e : votesByNomination.entrySet()) {
            long v = e.getValue() == null ? 0L : e.getValue();
            BigDecimal score = (denominator == 0L)
                    ? BigDecimal.ZERO.setScale(SCALE)          // nobody voted: everyone gets 0, not a crash
                    : BigDecimal.valueOf(v)
                        .divide(BigDecimal.valueOf(denominator), 10, ROUNDING)
                        .multiply(HUNDRED)
                        .setScale(SCALE, ROUNDING);
            out.put(e.getKey(), score);
        }
        return out;
    }

    // ------------------------------------------------------------------
    // Step 4: combine judge score and vote score
    // ------------------------------------------------------------------

    public BigDecimal combine(BigDecimal judgeScore, BigDecimal voteScore,
                              EvaluationMode mode,
                              BigDecimal judgeWeight, BigDecimal publicWeight) {

        BigDecimal j = judgeScore == null ? BigDecimal.ZERO : judgeScore;
        BigDecimal v = voteScore == null ? BigDecimal.ZERO : voteScore;

        switch (mode) {
            case JUDGE_ONLY:
                return j.setScale(SCALE, ROUNDING);
            case PUBLIC_ONLY:
                return v.setScale(SCALE, ROUNDING);
            case HYBRID:
            default:
                requireWeightsSumToOne(List.of(judgeWeight, publicWeight));
                return j.multiply(judgeWeight)
                        .add(v.multiply(publicWeight))
                        .setScale(SCALE, ROUNDING);
        }
    }

    // ------------------------------------------------------------------
    // Step 5: ranking and tie breaking
    // ------------------------------------------------------------------

    /**
     * One row of the ranking while it is being computed.
     * topCriterionScore is the nominee's aggregated score on the highest-weighted criterion -
     * the third tie breaker, on the principle that the criterion the organizer weighted most
     * heavily is the one that should separate two otherwise equal nominees.
     */
    public static class Rankable {
        public final Long nominationId;
        public final BigDecimal finalScore;
        public final BigDecimal judgeScore;
        public final BigDecimal voteScore;
        public final BigDecimal topCriterionScore;
        public int rank;
        public boolean winner;
        public String tieBreakNote;

        public Rankable(Long nominationId, BigDecimal finalScore, BigDecimal judgeScore,
                        BigDecimal voteScore, BigDecimal topCriterionScore) {
            this.nominationId = nominationId;
            this.finalScore = finalScore;
            this.judgeScore = judgeScore;
            this.voteScore = voteScore;
            this.topCriterionScore = topCriterionScore;
        }
    }

    private static BigDecimal nz(BigDecimal b) { return b == null ? BigDecimal.ZERO : b; }

    /**
     * Deterministic tie-break cascade:
     *   1. higher final score
     *   2. higher judge score
     *   3. higher public vote score
     *   4. higher score on the highest-weighted criterion
     *   5. unresolved - both keep the same rank, nobody is flagged winner, and the
     *      organizer must decide manually. The result set cannot be published in that state.
     *
     * Never rely on database ordering to break a tie: it is not reproducible, and a result
     * you cannot reproduce is a result you cannot defend.
     */
    public List<Rankable> rank(List<Rankable> rows) {
        List<Rankable> sorted = new ArrayList<>(rows);
        sorted.sort((a, b) -> {
            int c = nz(b.finalScore).compareTo(nz(a.finalScore));
            if (c != 0) return c;
            c = nz(b.judgeScore).compareTo(nz(a.judgeScore));
            if (c != 0) return c;
            c = nz(b.voteScore).compareTo(nz(a.voteScore));
            if (c != 0) return c;
            c = nz(b.topCriterionScore).compareTo(nz(a.topCriterionScore));
            if (c != 0) return c;
            return 0;
        });

        for (int i = 0; i < sorted.size(); i++) {
            Rankable cur = sorted.get(i);
            if (i == 0) {
                cur.rank = 1;
            } else {
                Rankable prev = sorted.get(i - 1);
                boolean fullyTied = fullyTied(prev, cur);
                cur.rank = fullyTied ? prev.rank : i + 1;
                if (fullyTied) {
                    String note = "Unresolved tie with nomination " + prev.nominationId
                            + " - organizer decision required.";
                    cur.tieBreakNote = note;
                    prev.tieBreakNote = note;
                } else if (nz(prev.finalScore).compareTo(nz(cur.finalScore)) == 0) {
                    cur.tieBreakNote = "Tied on final score; separated by " + separatedBy(prev, cur) + ".";
                }
            }
        }

        // Winner = rank 1, but only when rank 1 is unique and not an unresolved tie.
        long atRankOne = sorted.stream().filter(r -> r.rank == 1).count();
        if (atRankOne == 1) {
            sorted.get(0).winner = true;
        }
        return sorted;
    }

    private boolean fullyTied(Rankable a, Rankable b) {
        return nz(a.finalScore).compareTo(nz(b.finalScore)) == 0
                && nz(a.judgeScore).compareTo(nz(b.judgeScore)) == 0
                && nz(a.voteScore).compareTo(nz(b.voteScore)) == 0
                && nz(a.topCriterionScore).compareTo(nz(b.topCriterionScore)) == 0;
    }

    private String separatedBy(Rankable a, Rankable b) {
        if (nz(a.judgeScore).compareTo(nz(b.judgeScore)) != 0) return "judge score";
        if (nz(a.voteScore).compareTo(nz(b.voteScore)) != 0) return "public vote score";
        return "highest-weighted criterion";
    }

    // ------------------------------------------------------------------

    /** Weights are a contract: if they do not sum to 1.00 the final score is not on a 0-100 scale. */
    public void requireWeightsSumToOne(Collection<BigDecimal> weights) {
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal w : weights) {
            if (w == null) throw new BusinessRuleException("A weight is missing.");
            sum = sum.add(w);
        }
        BigDecimal diff = sum.subtract(BigDecimal.ONE).abs();
        if (diff.compareTo(new BigDecimal("0.0001")) > 0) {
            throw new BusinessRuleException("Weights must total 1.00 but total " + sum + ".");
        }
    }
}
