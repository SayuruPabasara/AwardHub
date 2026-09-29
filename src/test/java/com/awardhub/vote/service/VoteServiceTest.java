package com.awardhub.vote.service;

import com.awardhub.category.entity.Category;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.NominationStatus;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import com.awardhub.user.entity.User;
import com.awardhub.vote.dto.VoteDTOs.VoteDto;
import com.awardhub.vote.dto.VoteDTOs.VoteRequest;
import com.awardhub.vote.entity.Vote;
import com.awardhub.vote.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private NominationRepository nominationRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private VoteService voteService;

    private User voter;
    private Category category;
    private Nomination nomination;

    @BeforeEach
    void setUp() {
        voter = new User();
        voter.setId(10L);
        voter.setFullName("John Doe");
        voter.setNic("200012345678");

        category = new Category();
        category.setId(1L);
        category.setName("Best Innovator");
        category.setStatus(CategoryStatus.VOTING_OPEN);
        category.setVotingStartDate(LocalDateTime.now().minusDays(1));
        category.setVotingEndDate(LocalDateTime.now().plusDays(5));

        nomination = new Nomination();
        nomination.setId(100L);
        nomination.setCategoryId(1L);
        nomination.setTitle("Project AI Alpha");
        nomination.setStatus(NominationStatus.APPROVED);
    }

    @Test
    void cast_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(voteRepository.existsByVoterIdAndCategoryId(10L, 1L)).thenReturn(false);
        when(voteRepository.existsByCategoryIdAndNicIgnoreCase(1L, "200012345678")).thenReturn(false);
        when(nominationRepository.findById(100L)).thenReturn(Optional.of(nomination));

        Vote savedVote = new Vote(1L, nomination, voter, "200012345678");
        savedVote.setId(500L);
        when(voteRepository.save(any(Vote.class))).thenReturn(savedVote);

        VoteRequest req = new VoteRequest("200012345678", 100L);
        VoteDto result = voteService.cast(1L, req, voter, "127.0.0.1");

        assertNotNull(result);
        assertEquals(500L, result.id());
        assertEquals(1L, result.categoryId());
        assertEquals(100L, result.nominationId());
        assertEquals("Project AI Alpha", result.nomineeTitle());

        verify(voteRepository, times(1)).save(any(Vote.class));
        verify(auditLogService, times(1)).log(eq(10L), eq("VOTE_CAST"), eq("Vote"), eq(500L), anyString());
    }

    @Test
    void cast_categoryNotFound_throwsException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        VoteRequest req = new VoteRequest("200012345678", 100L);
        assertThrows(ResourceNotFoundException.class, () -> voteService.cast(99L, req, voter, "127.0.0.1"));
    }

    @Test
    void cast_votingClosed_throwsException() {
        category.setStatus(CategoryStatus.VOTING_CLOSED);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("Voting is closed for this category.", ex.getMessage());
    }

    @Test
    void cast_beforeVotingStart_throwsException() {
        category.setVotingStartDate(LocalDateTime.now().plusDays(2));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("Voting has not opened yet for this category.", ex.getMessage());
    }

    @Test
    void cast_afterVotingEnd_throwsException() {
        category.setVotingEndDate(LocalDateTime.now().minusDays(1));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("Voting has closed for this category.", ex.getMessage());
    }

    @Test
    void cast_nicMismatch_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        VoteRequest req = new VoteRequest("999999999999", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("NIC does not match the NIC registered to your account.", ex.getMessage());
        verify(auditLogService, times(1)).log(eq(10L), eq("VOTE_ATTEMPT_FAILED"), eq("Category"), eq(1L), anyString());
    }

    @Test
    void cast_duplicateVoteSameAccount_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(voteRepository.existsByVoterIdAndCategoryId(10L, 1L)).thenReturn(true);

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("already voted in this category"));
    }

    @Test
    void cast_duplicateVoteSameNicDifferentAccount_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(voteRepository.existsByVoterIdAndCategoryId(10L, 1L)).thenReturn(false);
        when(voteRepository.existsByCategoryIdAndNicIgnoreCase(1L, "200012345678")).thenReturn(true);

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("Only one vote per person"));
        verify(auditLogService, times(1)).log(eq(10L), eq("VOTE_DUPLICATE_NIC_BLOCKED"), eq("Category"), eq(1L), anyString());
    }

    @Test
    void cast_nominationCategoryMismatch_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(voteRepository.existsByVoterIdAndCategoryId(10L, 1L)).thenReturn(false);
        when(voteRepository.existsByCategoryIdAndNicIgnoreCase(1L, "200012345678")).thenReturn(false);

        Nomination otherNomination = new Nomination();
        otherNomination.setId(100L);
        otherNomination.setCategoryId(99L);
        when(nominationRepository.findById(100L)).thenReturn(Optional.of(otherNomination));

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("This nomination does not belong to the selected category.", ex.getMessage());
    }

    @Test
    void cast_nominationNotApproved_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(voteRepository.existsByVoterIdAndCategoryId(10L, 1L)).thenReturn(false);
        when(voteRepository.existsByCategoryIdAndNicIgnoreCase(1L, "200012345678")).thenReturn(false);

        nomination.setStatus(NominationStatus.SUBMITTED);
        when(nominationRepository.findById(100L)).thenReturn(Optional.of(nomination));

        VoteRequest req = new VoteRequest("200012345678", 100L);
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.cast(1L, req, voter, "127.0.0.1"));
        assertEquals("Votes can only be cast for approved nominations.", ex.getMessage());
    }

    @Test
    void withdraw_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Vote vote = new Vote(1L, nomination, voter, "200012345678");
        vote.setId(500L);
        when(voteRepository.findByVoterIdAndCategoryId(10L, 1L)).thenReturn(Optional.of(vote));

        voteService.withdraw(1L, voter, "127.0.0.1");

        verify(voteRepository, times(1)).delete(vote);
        verify(auditLogService, times(1)).log(eq(10L), eq("VOTE_WITHDRAWN"), eq("Vote"), eq(500L), anyString());
    }

    @Test
    void withdraw_afterWindowClosed_throwsException() {
        category.setStatus(CategoryStatus.VOTING_CLOSED);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> voteService.withdraw(1L, voter, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("Voting is closed"));
    }

    @Test
    void mine_returnsVotes() {
        Vote vote = new Vote(1L, nomination, voter, "200012345678");
        vote.setId(500L);
        when(voteRepository.findByVoterId(10L)).thenReturn(List.of(vote));

        List<VoteDto> mine = voteService.mine(voter);
        assertEquals(1, mine.size());
        assertEquals(500L, mine.get(0).id());
        assertEquals("Project AI Alpha", mine.get(0).nomineeTitle());
    }
}
