package com.awardhub.service;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.dto.DTOs.FeedbackDto;
import com.awardhub.dto.DTOs.FeedbackRequest;
import com.awardhub.entity.Feedback;
import com.awardhub.entity.User;
import com.awardhub.entity.Voting;
import com.awardhub.repository.FeedbackRepository;
import com.awardhub.repository.VotingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final VotingRepository votings;

    public FeedbackService(FeedbackRepository feedbackRepo, VotingRepository votings) {
        this.feedbackRepo = feedbackRepo;
        this.votings = votings;
    }

    @Transactional
    public FeedbackDto submit(User actor, FeedbackRequest req) {
        if (req.rating() < 1 || req.rating() > 5) throw new BadRequestException("Rating must be between 1 and 5.");
        Feedback f = new Feedback();
        f.setAuthor(actor);
        f.setAuthorName(actor != null ? actor.getName() : "Anonymous");
        f.setAuthorRole(actor != null ? actor.getRole().name() : "ANONYMOUS");
        if (req.votingId() != null) {
            Voting voting = votings.findById(req.votingId())
                    .orElseThrow(() -> new BadRequestException("Voting not found: " + req.votingId()));
            f.setVoting(voting);
        }
        f.setRating(req.rating());
        f.setComment(req.comment());
        feedbackRepo.save(f);
        return FeedbackDto.from(f);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> mine(User actor) {
        return feedbackRepo.findAllByOrderBySubmittedAtDesc().stream()
                .filter(f -> f.getAuthor() != null && f.getAuthor().getId().equals(actor.getId()))
                .map(FeedbackDto::from)
                .toList();
    }
}
