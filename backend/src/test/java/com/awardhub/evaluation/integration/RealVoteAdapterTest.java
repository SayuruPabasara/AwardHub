package com.awardhub.evaluation.integration;

import com.awardhub.vote.repository.VoteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RealVoteAdapterTest {

    @Mock
    private VoteRepository voteRepository;

    @InjectMocks
    private RealVoteAdapter realVoteAdapter;

    @Test
    void voteCounts_returnsGroupedVoteCounts() {
        Long categoryId = 42L;
        List<Object[]> queryResults = List.of(
                new Object[]{101L, 15L},
                new Object[]{102L, 8L}
        );

        when(voteRepository.countVotesGroupedByNomination(categoryId)).thenReturn(queryResults);

        Map<Long, Long> counts = realVoteAdapter.voteCounts(categoryId);

        assertEquals(2, counts.size());
        assertEquals(15L, counts.get(101L));
        assertEquals(8L, counts.get(102L));
    }

    @Test
    void voteCounts_emptyWhenNoVotes() {
        Long categoryId = 42L;
        when(voteRepository.countVotesGroupedByNomination(categoryId)).thenReturn(List.of());

        Map<Long, Long> counts = realVoteAdapter.voteCounts(categoryId);

        assertEquals(0, counts.size());
    }
}
