package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.model.AggregationMethod;
import com.awardhub.evaluation.model.EvaluationMode;
import com.awardhub.evaluation.model.VoteNormalization;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * These tests are the evidence that the weighted algorithm works - bring them to the viva.
 * Run in IntelliJ with the green arrow next to the class name, or: mvn test
 */
class ScoringEngineTest {

    private final ScoringEngine engine = new ScoringEngine();

    private Map<Long, BigDecimal> weights() {
        Map<Long, BigDecimal> w = new LinkedHashMap<>();
        w.put(1L, new BigDecimal("0.40"));   // Impact
        w.put(2L, new BigDecimal("0.35"));   // Consistency
        w.put(3L, new BigDecimal("0.25"));   // Leadership
        return w;
    }

    private Map<Long, BigDecimal> scores(String a, String b, String c) {
        Map<Long, BigDecimal> s = new LinkedHashMap<>();
        s.put(1L, new BigDecimal(a));
        s.put(2L, new BigDecimal(b));
        s.put(3L, new BigDecimal(c));
        return s;
    }

    @Test
    @DisplayName("Top marks on every criterion give exactly 100")
    void perfectScore() {
        assertEquals(0, engine.judgeScore(scores("10", "10", "10"), weights(), 1, 10)
                .compareTo(new BigDecimal("100")));
    }

    @Test
    @DisplayName("Bottom of the scale gives 0, not 10 - the min-max step is applied")
    void lowestScore() {
        assertEquals(0, engine.judgeScore(scores("1", "1", "1"), weights(), 1, 10)
                .compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Mixed scores are weighted: 9/7/8 on a 1-10 scale gives 78.3333")
    void weightedScore() {
        // weighted raw = 9(0.40) + 7(0.35) + 8(0.25) = 8.05  ->  (8.05-1)/9*100 = 78.3333
        assertEquals(new BigDecimal("78.3333"),
                engine.judgeScore(scores("9", "7", "8"), weights(), 1, 10));
    }

    @Test
    @DisplayName("A score outside the rubric scale is rejected")
    void rejectsOutOfScale() {
        assertThrows(BusinessRuleException.class,
                () -> engine.judgeScore(scores("11", "5", "5"), weights(), 1, 10));
    }

    @Test
    @DisplayName("A missing criterion score is rejected instead of being treated as zero")
    void rejectsMissingCriterion() {
        Map<Long, BigDecimal> partial = new LinkedHashMap<>();
        partial.put(1L, new BigDecimal("8"));
        assertThrows(BusinessRuleException.class,
                () -> engine.judgeScore(partial, weights(), 1, 10));
    }

    @Test
    @DisplayName("Weights that do not total 1.00 are rejected")
    void rejectsBadWeights() {
        Map<Long, BigDecimal> bad = new LinkedHashMap<>();
        bad.put(1L, new BigDecimal("0.50"));
        bad.put(2L, new BigDecimal("0.20"));
        assertThrows(BusinessRuleException.class, () -> engine.requireWeightsSumToOne(bad.values()));
    }

    @Test
    @DisplayName("Trimmed mean drops one harsh and one generous judge")
    void trimmedMean() {
        List<BigDecimal> five = List.of(new BigDecimal("10"), new BigDecimal("50"),
                new BigDecimal("60"), new BigDecimal("70"), new BigDecimal("90"));
        assertEquals(new BigDecimal("56.0000"), engine.aggregateJudgeScores(five, AggregationMethod.MEAN));
        assertEquals(new BigDecimal("60.0000"), engine.aggregateJudgeScores(five, AggregationMethod.TRIMMED_MEAN));
        assertEquals(new BigDecimal("60.0000"), engine.aggregateJudgeScores(five, AggregationMethod.MEDIAN));
    }

    @Test
    @DisplayName("Trimmed mean falls back to plain mean below five judges")
    void trimmedMeanFallback() {
        List<BigDecimal> three = List.of(new BigDecimal("10"), new BigDecimal("60"), new BigDecimal("80"));
        assertEquals(new BigDecimal("50.0000"),
                engine.aggregateJudgeScores(three, AggregationMethod.TRIMMED_MEAN));
    }

    @Test
    @DisplayName("Vote counts normalise to 0-100 inside the category")
    void voteNormalisation() {
        Map<Long, Long> votes = new LinkedHashMap<>();
        votes.put(1L, 400L);
        votes.put(2L, 300L);
        votes.put(3L, 100L);

        Map<Long, BigDecimal> max = engine.normalizeVotes(votes, VoteNormalization.MAX_IN_CATEGORY);
        assertEquals(new BigDecimal("100.0000"), max.get(1L));
        assertEquals(new BigDecimal("75.0000"), max.get(2L));

        Map<Long, BigDecimal> share = engine.normalizeVotes(votes, VoteNormalization.SHARE_OF_TOTAL);
        assertEquals(new BigDecimal("50.0000"), share.get(1L));
        assertEquals(new BigDecimal("12.5000"), share.get(3L));
    }

    @Test
    @DisplayName("A category where nobody voted scores zero instead of dividing by zero")
    void noVotes() {
        Map<Long, Long> votes = new LinkedHashMap<>();
        votes.put(1L, 0L);
        votes.put(2L, 0L);
        Map<Long, BigDecimal> out = engine.normalizeVotes(votes, VoteNormalization.MAX_IN_CATEGORY);
        assertEquals(0, out.get(1L).compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Hybrid combines 70% judge and 30% public")
    void hybridCombination() {
        assertEquals(new BigDecimal("74.0000"),
                engine.combine(new BigDecimal("80"), new BigDecimal("60"), EvaluationMode.HYBRID,
                        new BigDecimal("0.70"), new BigDecimal("0.30")));
    }

    @Test
    @DisplayName("Judge-only and public-only ignore the other side entirely")
    void singleSourceModes() {
        assertEquals(new BigDecimal("80.0000"),
                engine.combine(new BigDecimal("80"), new BigDecimal("60"),
                        EvaluationMode.JUDGE_ONLY, null, null));
        assertEquals(new BigDecimal("60.0000"),
                engine.combine(new BigDecimal("80"), new BigDecimal("60"),
                        EvaluationMode.PUBLIC_ONLY, null, null));
    }

    @Test
    @DisplayName("A tie on final score is broken by the higher judge score")
    void tieBrokenByJudgeScore() {
        List<ScoringEngine.Rankable> rows = new ArrayList<>();
        rows.add(new ScoringEngine.Rankable(1L, new BigDecimal("74.0000"), new BigDecimal("80"),
                new BigDecimal("60"), new BigDecimal("9")));
        rows.add(new ScoringEngine.Rankable(2L, new BigDecimal("74.0000"), new BigDecimal("85"),
                new BigDecimal("48"), new BigDecimal("8")));

        List<ScoringEngine.Rankable> ranked = engine.rank(rows);
        assertEquals(2L, ranked.get(0).nominationId);
        assertTrue(ranked.get(0).winner);
        assertEquals(1, ranked.get(0).rank);
        assertEquals(2, ranked.get(1).rank);
        assertNotNull(ranked.get(1).tieBreakNote);
    }

    @Test
    @DisplayName("A tie the cascade cannot separate produces no winner and is flagged for the organizer")
    void unresolvedTie() {
        List<ScoringEngine.Rankable> rows = new ArrayList<>();
        rows.add(new ScoringEngine.Rankable(1L, new BigDecimal("70.0000"), new BigDecimal("70"),
                new BigDecimal("70"), new BigDecimal("7")));
        rows.add(new ScoringEngine.Rankable(2L, new BigDecimal("70.0000"), new BigDecimal("70"),
                new BigDecimal("70"), new BigDecimal("7")));

        List<ScoringEngine.Rankable> ranked = engine.rank(rows);
        assertEquals(1, ranked.get(0).rank);
        assertEquals(1, ranked.get(1).rank);
        assertFalse(ranked.get(0).winner);
        assertFalse(ranked.get(1).winner);
        assertTrue(ranked.get(0).tieBreakNote.startsWith("Unresolved tie"));
    }

    @Test
    @DisplayName("Ranking is by final score, highest first")
    void rankingOrder() {
        List<ScoringEngine.Rankable> rows = new ArrayList<>();
        rows.add(new ScoringEngine.Rankable(1L, new BigDecimal("55"), new BigDecimal("55"),
                new BigDecimal("55"), new BigDecimal("5")));
        rows.add(new ScoringEngine.Rankable(2L, new BigDecimal("91"), new BigDecimal("91"),
                new BigDecimal("91"), new BigDecimal("9")));
        rows.add(new ScoringEngine.Rankable(3L, new BigDecimal("73"), new BigDecimal("73"),
                new BigDecimal("73"), new BigDecimal("7")));

        List<ScoringEngine.Rankable> ranked = engine.rank(rows);
        assertEquals(2L, ranked.get(0).nominationId);
        assertEquals(3L, ranked.get(1).nominationId);
        assertEquals(1L, ranked.get(2).nominationId);
    }
}
