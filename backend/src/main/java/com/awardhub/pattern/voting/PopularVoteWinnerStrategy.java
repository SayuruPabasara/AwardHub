package com.awardhub.pattern.voting;

import com.awardhub.entity.Nomination;
import com.awardhub.entity.Voting;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/** ConcreteStrategy: most public votes wins (used for {@code winner}). */
@Component("popularVoteWinnerStrategy")
public class PopularVoteWinnerStrategy implements WinnerStrategy {

    @Override
    public String key() { return "popular"; }

    @Override
    public Optional<Nomination> pickWinner(Voting voting, List<Nomination> approvedNominations) {
        return approvedNominations.stream()
                .max(Comparator.comparingLong(Nomination::getVoteCount));
    }
}
