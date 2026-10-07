package com.awardhub.pattern.voting;

import com.awardhub.entity.Nomination;
import com.awardhub.entity.Voting;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/** ConcreteStrategy: highest judge rubric score wins (used for {@code judgeWinner}). */
@Component("judgeScoreWinnerStrategy")
public class JudgeScoreWinnerStrategy implements WinnerStrategy {

    @Override
    public String key() { return "judge"; }

    @Override
    public Optional<Nomination> pickWinner(Voting voting, List<Nomination> approvedNominations) {
        return approvedNominations.stream()
                .filter(n -> n.getJudgeScore() != null)
                .max(Comparator.comparing(Nomination::getJudgeScore, Comparator.nullsFirst(BigDecimal::compareTo)));
    }
}
