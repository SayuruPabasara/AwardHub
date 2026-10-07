package com.awardhub.service;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.config.GlobalExceptionHandler.NotFoundException;
import com.awardhub.dto.DTOs.StatsDto;
import com.awardhub.dto.DTOs.VotingCreateRequest;
import com.awardhub.dto.DTOs.VotingDto;
import com.awardhub.dto.DTOs.WinnerDto;
import com.awardhub.dto.DTOs.InviteHeadOrganizerRequest;
import com.awardhub.entity.Nomination;
import com.awardhub.entity.RubricCriterion;
import com.awardhub.entity.User;
import com.awardhub.entity.Voting;
import com.awardhub.pattern.voting.VotingFactory;
import com.awardhub.pattern.voting.VotingManager;
import com.awardhub.pattern.voting.VotingSubject;
import com.awardhub.pattern.voting.WinnerStrategyContext;
import com.awardhub.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class VotingService {

    private final VotingRepository votings;
    private final NominationRepository nominations;
    private final VoteRepository votes;
    private final UserRepository users;
    private final JudgeAssignmentRepository assignments;
    private final RubricCriterionRepository rubrics;
    private final AuditService audit;
    private final OrganizerService organizerService;
    private final VotingSubject votingSubject;
    private final WinnerStrategyContext winnerStrategies;

    public VotingService(VotingRepository votings, NominationRepository nominations, VoteRepository votes,
                         UserRepository users, JudgeAssignmentRepository assignments,
                         RubricCriterionRepository rubrics, AuditService audit,
                         @Lazy OrganizerService organizerService,
                         VotingSubject votingSubject, WinnerStrategyContext winnerStrategies) {
        this.votings = votings;
        this.nominations = nominations;
        this.votes = votes;
        this.users = users;
        this.assignments = assignments;
        this.rubrics = rubrics;
        this.audit = audit;
        this.organizerService = organizerService;
        this.votingSubject = votingSubject;
        this.winnerStrategies = winnerStrategies;
    }

    /** Default rubric seeded whenever judging is enabled on a contest, so judges
     *  always have criteria to score against. Mirrors the seeded rubrics used by
     *  the demo contests. */
    private void seedDefaultRubricIfMissing(Voting v) {
        if (!v.isHasJudging()) return;
        if (!rubrics.findByVotingIdOrderBySortOrderAsc(v.getId()).isEmpty()) return;

        String[][] defaults = {
            {"Excellence", "Overall quality and mastery of craft",
                "9-10: Exceptional, industry-leading. 7-8: Strong and polished. 5-6: Competent. 3-4: Developing. 1-2: Significant gaps."},
            {"Innovation", "Originality and creative approach",
                "9-10: Groundbreaking, new ideas. 7-8: Distinctly fresh approach. 5-6: Some originality. 3-4: Largely conventional. 1-2: Derivative."},
            {"Cultural Impact", "Significance and influence on the field",
                "9-10: Transformative cultural contribution. 7-8: Clear positive influence. 5-6: Moderate reach. 3-4: Limited scope. 1-2: Minimal demonstrated impact."},
            {"Presentation", "Clarity and strength of the submission",
                "9-10: Exceptional clarity and professionalism. 7-8: Well-structured. 5-6: Adequately presented. 3-4: Some confusion. 1-2: Unclear or incomplete."},
            {"Evidence Quality", "Supporting materials and proof of claims",
                "9-10: Compelling, verifiable proof. 7-8: Strong supporting docs. 5-6: Adequate evidence. 3-4: Sparse. 1-2: Unsubstantiated claims."},
        };
        for (int i = 0; i < defaults.length; i++) {
            RubricCriterion rc = new RubricCriterion();
            rc.setVoting(v);
            rc.setLabel(defaults[i][0]);
            rc.setDescription(defaults[i][1]);
            rc.setGuidance(defaults[i][2]);
            rc.setMaxScore(10);
            rc.setSortOrder(i + 1);
            rubrics.save(rc);
        }
    }

    @Transactional(readOnly = true)
    public List<VotingDto> listAll() {
        return votings.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public VotingDto get(Long id) {
        return toDto(find(id));
    }

    @Transactional
    public VotingDto create(VotingCreateRequest req, User actor, String ip) {
        if (req.name() == null || req.name().isBlank()) {
            throw new BadRequestException("Voting contest name is required.");
        }
        if (votings.existsByNameIgnoreCase(req.name().trim())) {
            throw new BadRequestException("A voting contest with the name '" + req.name().trim() + "' already exists.");
        }

        Voting v = VotingManager.getInstance().newVoting(req);

        // Status
        if (req.status() != null && !req.status().isBlank()) {
            try {
                v.setStatus(Voting.Status.valueOf(req.status().toLowerCase(Locale.ROOT)));
            } catch (Exception e) {
                v.setStatus(initialStatus(req));
            }
        } else {
            v.setStatus(initialStatus(req));
        }

        // Head organizer direct assignment (one organizer → one contest)
        if (req.headOrganizerId() != null) {
            User ho = users.findById(req.headOrganizerId())
                    .orElseThrow(() -> new NotFoundException("Head Organizer user not found: " + req.headOrganizerId()));
            Optional<Voting> other = votings.findAllByHeadOrganizerId(ho.getId()).stream().findFirst();
            if (other.isPresent()) {
                throw new BadRequestException(ho.getName() + " is already Head Organizer for contest: "
                        + other.get().getName() + ". One organizer can manage only one contest — unassign them first.");
            }
            ho.setRole(User.Role.HEAD_ORGANIZER);
            users.save(ho);
            v.setHeadOrganizer(ho);
        }

        votings.save(v);
        seedDefaultRubricIfMissing(v);
        // OBSERVER: observers (e.g. AuditVotingObserver) react instead of a hardcoded audit call.
        votingSubject.notifyObservers(v, "VOTING_CREATED", actor, ip);

        // Inline Head Organizer invitation if email was provided and no direct user assigned
        if (req.headOrganizerId() == null && req.headOrganizerEmail() != null && !req.headOrganizerEmail().isBlank()) {
            organizerService.inviteHeadOrganizer(new InviteHeadOrganizerRequest(req.headOrganizerEmail(), v.getId()), actor, ip);
        }

        return toDto(v);
    }

    @Transactional
    public VotingDto update(Long id, VotingCreateRequest req, User actor, String ip) {
        Voting v = find(id);
        if (req.name() != null && !req.name().isBlank() && votings.existsByNameIgnoreCaseAndIdNot(req.name().trim(), id)) {
            throw new BadRequestException("Another voting contest with the name '" + req.name().trim() + "' already exists.");
        }

        VotingFactory.apply(v, req);

        if (req.status() != null && !req.status().isBlank()) {
            try {
                v.setStatus(Voting.Status.valueOf(req.status().toLowerCase(Locale.ROOT)));
            } catch (Exception ignored) {}
        }

        if (req.headOrganizerId() != null) {
            User ho = users.findById(req.headOrganizerId())
                    .orElseThrow(() -> new NotFoundException("Head Organizer user not found: " + req.headOrganizerId()));
            Optional<Voting> other = votings.findAllByHeadOrganizerId(ho.getId()).stream()
                    .filter(x -> !x.getId().equals(id)).findFirst();
            if (other.isPresent()) {
                throw new BadRequestException(ho.getName() + " is already Head Organizer for contest: "
                        + other.get().getName() + ". One organizer can manage only one contest — unassign them first.");
            }
            ho.setRole(User.Role.HEAD_ORGANIZER);
            users.save(ho);
            v.setHeadOrganizer(ho);
        }

        votings.save(v);
        seedDefaultRubricIfMissing(v);
        // OBSERVER pattern: notify instead of hardcoded audit call.
        votingSubject.notifyObservers(v, "VOTING_UPDATED", actor, ip);

        if (req.headOrganizerId() == null && req.headOrganizerEmail() != null && !req.headOrganizerEmail().isBlank()) {
            organizerService.inviteHeadOrganizer(new InviteHeadOrganizerRequest(req.headOrganizerEmail(), v.getId()), actor, ip);
        }

        return toDto(v);
    }

    @Transactional
    public void delete(Long id, User actor, String ip) {
        Voting v = find(id);
        votings.delete(v);
        votingSubject.notifyObservers(v, "VOTING_DELETED", actor, ip);
    }

    /** STRATEGY pattern: pick winner algorithm at runtime (mode = popular|judge). */
    @Transactional(readOnly = true)
    public Nomination resolveWinner(Long id, String mode) {
        Voting v = find(id);
        var approved = nominations.findByVotingIdAndStatus(id, Nomination.Status.approved);
        return winnerStrategies.resolveWinner(v, approved, mode).orElse(null);
    }

    private void apply(Voting v, VotingCreateRequest req) {
        v.setName(req.name());
        v.setDescription(req.description());
        v.setEligibility(req.eligibility());
        v.setImageUrl(req.imageUrl());
        v.setHasJudging(req.hasJudging());
        v.setNominationStart(req.nominationStart());
        v.setNominationEnd(req.nominationEnd());
        v.setVotingStart(req.votingStart());
        v.setVotingEnd(req.votingEnd());
        v.setJudgingStart(req.judgingStart());
        v.setJudgingEnd(req.judgingEnd());
    }

    private Voting.Status initialStatus(VotingCreateRequest req) {
        LocalDate today = LocalDate.now();
        if (req.votingStart() != null && !today.isBefore(req.votingStart())
                && req.votingEnd() != null && !today.isAfter(req.votingEnd())) return Voting.Status.voting;
        if (req.judgingStart() != null && !today.isBefore(req.judgingStart())) return Voting.Status.judging;
        if (req.votingEnd() != null && today.isAfter(req.votingEnd())) return Voting.Status.ended;
        if (req.nominationStart() != null && !today.isBefore(req.nominationStart())) return Voting.Status.collecting;
        return Voting.Status.draft;
    }

    @Transactional(readOnly = true)
    public StatsDto stats() {
        LocalDate today = LocalDate.now();
        String daysLeft = votings.findAll().stream()
                .filter(v -> v.getVotingEnd() != null && !v.getVotingEnd().isBefore(today))
                .map(v -> (int) ChronoUnit.DAYS.between(today, v.getVotingEnd()))
                .max(Integer::compareTo)
                .map(d -> String.format("%02d", d))
                .orElse("00");
        return new StatsDto(users.count(), nominations.count(), votings.count(), votes.count(), daysLeft);
    }

    @Transactional(readOnly = true)
    public List<WinnerDto> winners() {
        return votings.findAll().stream()
                .filter(v -> v.getWinner() != null || v.getJudgeWinner() != null)
                .map(v -> {
                    Nomination popular = v.getWinner();
                    Nomination judgeWinner = v.getJudgeWinner();
                    return new WinnerDto(v.getId(), v.getName(),
                            v.getVotingEnd() != null ? String.valueOf(v.getVotingEnd().getYear()) : "",
                            popular != null ? popular.getNomineeName() : (judgeWinner != null ? judgeWinner.getNomineeName() : null),
                            popular != null ? popular.getVoteCount() : 0,
                            popular != null && popular.getJudgeScore() != null ? popular.getJudgeScore() : BigDecimal.ZERO,
                            v.getImageUrl(),
                            v.isHasJudging(),
                            judgeWinner != null ? judgeWinner.getNomineeName() : null,
                            judgeWinner != null ? judgeWinner.getJudgeScore() : null);
                })
                .toList();
    }

    public Voting find(Long id) {
        return votings.findById(id).orElseThrow(() -> new NotFoundException("Voting not found: " + id));
    }

    public VotingDto toDto(Voting v) {
        long approved = nominations.countByVotingIdAndStatus(v.getId(), Nomination.Status.approved);
        long voteCount = votes.countByVotingId(v.getId());
        int judgeCount = assignments.findByVotingId(v.getId()).size();
        return VotingDto.from(v, approved, voteCount, judgeCount);
    }
}
