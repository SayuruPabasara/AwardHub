package com.awardhub.vote.service;

import com.awardhub.category.entity.Category;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.NominationStatus;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import com.awardhub.user.entity.User;
import com.awardhub.vote.dto.VoteDTOs.VoteDto;
import com.awardhub.vote.dto.VoteDTOs.VoteRequest;
import com.awardhub.vote.entity.Vote;
import com.awardhub.vote.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final CategoryRepository categoryRepository;
    private final NominationRepository nominationRepository;
    private final AuditLogService auditLogService;

    public VoteService(
            VoteRepository voteRepository,
            CategoryRepository categoryRepository,
            NominationRepository nominationRepository,
            AuditLogService auditLogService
    ) {
        this.voteRepository = voteRepository;
        this.categoryRepository = categoryRepository;
        this.nominationRepository = nominationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public VoteDto cast(Long categoryId, VoteRequest req, User actor, String ip) {
        if (actor == null) {
            throw new UnauthorizedActionException("User must be authenticated to vote.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        LocalDateTime now = LocalDateTime.now();
        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_CLOSED) {
            throw new BadRequestException("Voting is closed for this category.");
        }
        if (category.getVotingStartDate() != null && now.isBefore(category.getVotingStartDate())) {
            throw new BadRequestException("Voting has not opened yet for this category.");
        }
        if (category.getVotingEndDate() != null && now.isAfter(category.getVotingEndDate())) {
            throw new BadRequestException("Voting has closed for this category.");
        }

        if (req == null || req.nic() == null || req.nic().isBlank()) {
            throw new BadRequestException("NIC verification is required to vote.");
        }
        String nic = req.nic().trim().toUpperCase();
        if (actor.getNic() == null || !nic.equalsIgnoreCase(actor.getNic().trim())) {
            auditLogService.log(actor.getId(), "VOTE_ATTEMPT_FAILED", "Category", categoryId,
                    "NIC mismatch during vote attempt from IP " + ip);
            throw new BadRequestException("NIC does not match the NIC registered to your account.");
        }

        if (voteRepository.existsByVoterIdAndCategoryId(actor.getId(), categoryId)) {
            throw new BadRequestException("You have already voted in this category. Withdraw your vote first to change it.");
        }
        if (voteRepository.existsByCategoryIdAndNicIgnoreCase(categoryId, nic)) {
            auditLogService.log(actor.getId(), "VOTE_DUPLICATE_NIC_BLOCKED", "Category", categoryId,
                    "Blocked duplicate vote: NIC " + nic + " already used in category " + categoryId + " by a different account");
            throw new BadRequestException("This NIC has already voted in this category with a different account. Only one vote per person.");
        }

        if (req.nominationId() == null) {
            throw new BadRequestException("Nomination ID is required.");
        }
        Nomination nomination = nominationRepository.findById(req.nominationId())
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found: " + req.nominationId()));

        if (!categoryId.equals(nomination.getCategoryId())) {
            throw new BadRequestException("This nomination does not belong to the selected category.");
        }
        if (nomination.getStatus() != NominationStatus.APPROVED) {
            throw new BadRequestException("Votes can only be cast for approved nominations.");
        }

        Vote vote = new Vote(categoryId, nomination, actor, nic);
        Vote saved = voteRepository.save(vote);

        auditLogService.log(actor.getId(), "VOTE_CAST", "Vote", saved.getId(),
                "Vote cast in category " + categoryId + " for nomination " + nomination.getId() + " (" + nomination.getTitle() + ")");

        return VoteDto.from(saved);
    }

    @Transactional
    public void withdraw(Long categoryId, User actor, String ip) {
        if (actor == null) {
            throw new UnauthorizedActionException("User must be authenticated to withdraw vote.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        LocalDateTime now = LocalDateTime.now();
        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_CLOSED) {
            throw new BadRequestException("Voting is closed. Votes cannot be withdrawn after voting has closed.");
        }
        if (category.getVotingEndDate() != null && now.isAfter(category.getVotingEndDate())) {
            throw new BadRequestException("Voting has closed for this category.");
        }

        Vote vote = voteRepository.findByVoterIdAndCategoryId(actor.getId(), categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not voted in this category."));

        voteRepository.delete(vote);

        auditLogService.log(actor.getId(), "VOTE_WITHDRAWN", "Vote", vote.getId(),
                "Vote withdrawn by voter for category " + categoryId);
    }

    @Transactional
    public VoteDto update(Long categoryId, VoteRequest req, User actor, String ip) {
        if (actor == null) {
            throw new UnauthorizedActionException("User must be authenticated to update vote.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        LocalDateTime now = LocalDateTime.now();
        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_CLOSED) {
            throw new BadRequestException("Voting is closed. Votes cannot be updated after voting has closed.");
        }
        if (category.getVotingStartDate() != null && now.isBefore(category.getVotingStartDate())) {
            throw new BadRequestException("Voting has not opened yet for this category.");
        }
        if (category.getVotingEndDate() != null && now.isAfter(category.getVotingEndDate())) {
            throw new BadRequestException("Voting has closed for this category.");
        }

        if (req == null || req.nominationId() == null) {
            throw new BadRequestException("Nomination ID is required.");
        }

        Vote vote = voteRepository.findByVoterIdAndCategoryId(actor.getId(), categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not voted in this category yet."));

        if (req.nic() != null && !req.nic().isBlank()) {
            String nic = req.nic().trim().toUpperCase();
            if (actor.getNic() == null || !nic.equalsIgnoreCase(actor.getNic().trim())) {
                auditLogService.log(actor.getId(), "VOTE_UPDATE_ATTEMPT_FAILED", "Category", categoryId,
                        "NIC mismatch during vote update attempt from IP " + ip);
                throw new BadRequestException("NIC does not match the NIC registered to your account.");
            }
        }

        Nomination nomination = nominationRepository.findById(req.nominationId())
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found: " + req.nominationId()));

        if (!categoryId.equals(nomination.getCategoryId())) {
            throw new BadRequestException("This nomination does not belong to the selected category.");
        }
        if (nomination.getStatus() != NominationStatus.APPROVED) {
            throw new BadRequestException("Votes can only be cast for approved nominations.");
        }

        vote.setNomination(nomination);
        vote.setCastedAt(LocalDateTime.now());
        Vote saved = voteRepository.save(vote);

        auditLogService.log(actor.getId(), "VOTE_UPDATED", "Vote", saved.getId(),
                "Vote updated in category " + categoryId + " to nomination " + nomination.getId() + " (" + nomination.getTitle() + ")");

        return VoteDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<VoteDto> mine(User actor) {
        if (actor == null) {
            throw new UnauthorizedActionException("User must be authenticated.");
        }
        return voteRepository.findByVoterId(actor.getId()).stream()
                .map(VoteDto::from)
                .toList();
    }
}
