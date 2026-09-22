package com.awardhub.service;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.config.GlobalExceptionHandler.NotFoundException;
import com.awardhub.dto.DTOs.VoteDto;
import com.awardhub.dto.DTOs.VoteRequest;
import com.awardhub.entity.Nomination;
import com.awardhub.entity.SuspiciousActivity;
import com.awardhub.entity.User;
import com.awardhub.entity.Vote;
import com.awardhub.entity.Voting;
import com.awardhub.repository.NominationRepository;
import com.awardhub.repository.UserRepository;
import com.awardhub.repository.VoteRepository;
import com.awardhub.repository.VotingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VoteService {

    private final VoteRepository votes;
    private final VotingRepository votings;
    private final NominationRepository nominations;
    private final UserRepository users;
    private final AuditService audit;

    public VoteService(VoteRepository votes, VotingRepository votings, NominationRepository nominations,
                       UserRepository users, AuditService audit) {
        this.votes = votes;
        this.votings = votings;
        this.nominations = nominations;
        this.users = users;
        this.audit = audit;
    }

    @Transactional
    public VoteDto cast(Long votingId, VoteRequest req, User actor, String ip) {
        Voting voting = votings.findById(votingId)
                .orElseThrow(() -> new NotFoundException("Voting not found: " + votingId));

        LocalDate today = LocalDate.now();
        if (voting.getVotingStart() != null && today.isBefore(voting.getVotingStart())) {
            throw new BadRequestException("Voting has not opened yet for this category.");
        }
        if (voting.getVotingEnd() != null && today.isAfter(voting.getVotingEnd())) {
            throw new BadRequestException("Voting has closed for this category.");
        }
        if (req.nic() == null || req.nic().isBlank()) {
            throw new BadRequestException("NIC verification is required to vote.");
        }
        String nic = req.nic().trim().toUpperCase();
        if (!nic.equalsIgnoreCase(actor.getNic())) {
            audit.log(actor, "VOTE_ATTEMPT", "voting-" + votingId, "NIC mismatch during vote attempt", ip, true);
            throw new BadRequestException("NIC does not match the NIC registered to your account.");
        }
        if (votes.existsByVoterIdAndVotingId(actor.getId(), votingId)) {
            throw new BadRequestException("You have already voted in this category. Withdraw your vote first to change it.");
        }
        if (votes.existsByVotingIdAndNicIgnoreCase(votingId, nic)) {
            audit.log(actor, "VOTE_ATTEMPT", "voting-" + votingId,
                    "Blocked duplicate vote: NIC " + nic + " already used in this voting by a different account", ip, true);
            audit.flag(actor, "Duplicate NIC vote attempt in voting " + votingId + ": NIC " + nic
                    + " has already voted there under a different account. Possible multi-account vote inflation from IP " + ip + ".",
                    SuspiciousActivity.Severity.high);
            throw new BadRequestException("This NIC has already voted in this category with a different account. Only one vote per person.");
        }

        Nomination nomination = nominations.findById(req.nominationId())
                .orElseThrow(() -> new NotFoundException("Nomination not found: " + req.nominationId()));
        if (!nomination.getVoting().getId().equals(votingId)) {
            throw new BadRequestException("This nomination does not belong to the selected voting.");
        }
        if (nomination.getStatus() != Nomination.Status.approved) {
            throw new BadRequestException("Votes can only be cast for approved nominations.");
        }

        Vote vote = new Vote();
        vote.setVoting(voting);
        vote.setNomination(nomination);
        vote.setVoter(actor);
        vote.setNic(nic);
        votes.save(vote);

        nomination.setVoteCount(nomination.getVoteCount() + 1);
        nominations.save(nomination);

        audit.log(actor, "VOTE_CAST", "voting-" + votingId + " / " + nomination.getNomineeName(),
                "Vote cast. NIC verified: " + actor.getNic(), ip, false);
        return VoteDto.from(vote);
    }

    @Transactional
    public void withdraw(Long votingId, User actor, String ip) {
        Vote vote = votes.findByVoterIdAndVotingId(actor.getId(), votingId)
                .orElseThrow(() -> new NotFoundException("You have not voted in this voting."));
        Nomination nomination = vote.getNomination();
        votes.delete(vote);
        nomination.setVoteCount(Math.max(0, nomination.getVoteCount() - 1));
        nominations.save(nomination);
        audit.log(actor, "VOTE_WITHDRAWN", "voting-" + votingId + " / " + nomination.getNomineeName(),
                "Vote withdrawn by voter", ip, false);
    }

    @Transactional(readOnly = true)
    public List<VoteDto> mine(User actor) {
        return votes.findByVoterId(actor.getId()).stream().map(VoteDto::from).toList();
    }
}
