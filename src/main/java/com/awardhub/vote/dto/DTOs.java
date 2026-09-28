package com.awardhub.dto;

import com.awardhub.entity.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTOs. Static factories map entities to JSON-friendly shapes.
 * Password hashes are never exposed.
 */
public final class DTOs {
    private DTOs() {}

    // ── Auth / user ──
    public record AuthResponse(String token, UserDto user) {}
    public record UserDto(Long id, String name, String email, String nic, String role,
                          String status, String bio, String location, String website, String avatar,
                          boolean notifEmail, boolean notifSms, boolean notifResults,
                          LocalDateTime createdAt, LocalDateTime lastLogin) {
        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getNic(), u.getRole().name(),
                    u.getStatus(), u.getBio(), u.getLocation(), u.getWebsite(), u.getAvatar(),
                    u.isNotifEmail(), u.isNotifSms(), u.isNotifResults(), u.getCreatedAt(), u.getLastLogin());
        }
    }
    public record RegisterRequest(String name, String email, String password, String nic) {}
    public record LoginRequest(String email, String password) {}
    public record ProfileUpdateRequest(String name, String bio, String location, String website,
                                       Boolean notifEmail, Boolean notifSms, Boolean notifResults) {}
    public record PasswordChangeRequest(String currentPassword, String newPassword) {}

    // ── Voting ──
    public record VotingDto(Long id, String name, String description, String eligibility, String imageUrl,
                            boolean hasJudging, LocalDate nominationStart, LocalDate nominationEnd,
                            LocalDate votingStart, LocalDate votingEnd, LocalDate judgingStart, LocalDate judgingEnd,
                            String status, Long winnerNominationId, String winnerName,
                            Long judgeWinnerNominationId, String judgeWinnerName,
                            Long headOrganizerId, String headOrganizerName, String headOrganizerEmail,
                            long approvedNomineeCount, long voteCount, int judgeCount) {
        public static VotingDto from(Voting v, long approvedNomineeCount, long voteCount, int judgeCount) {
            return new VotingDto(v.getId(), v.getName(), v.getDescription(), v.getEligibility(), v.getImageUrl(),
                    v.isHasJudging(), v.getNominationStart(), v.getNominationEnd(),
                    v.getVotingStart(), v.getVotingEnd(), v.getJudgingStart(), v.getJudgingEnd(),
                    v.getStatus().name(), v.getWinner() != null ? v.getWinner().getId() : null,
                    v.getWinner() != null ? v.getWinner().getNomineeName() : null,
                    v.getJudgeWinner() != null ? v.getJudgeWinner().getId() : null,
                    v.getJudgeWinner() != null ? v.getJudgeWinner().getNomineeName() : null,
                    v.getHeadOrganizer() != null ? v.getHeadOrganizer().getId() : null,
                    v.getHeadOrganizer() != null ? v.getHeadOrganizer().getName() : null,
                    v.getHeadOrganizer() != null ? v.getHeadOrganizer().getEmail() : null,
                    approvedNomineeCount, voteCount, judgeCount);
        }
    }
    public record VotingCreateRequest(String name, String description, String eligibility, String imageUrl,
                                      boolean hasJudging, LocalDate nominationStart, LocalDate nominationEnd,
                                      LocalDate votingStart, LocalDate votingEnd,
                                      LocalDate judgingStart, LocalDate judgingEnd,
                                      String status, Long headOrganizerId, String headOrganizerEmail) {}

    public record VotingStatusUpdateRequest(String status) {}

    // ── Nomination ──
    public record NominationDto(Long id, Long votingId, String votingName, Long nomineeId, String nomineeName,
                                String statement, String bio, String evidence, String portfolio,
                                String status, String rejectionReason, String blindCode,
                                long voteCount, BigDecimal judgeScore, LocalDateTime submittedAt) {
        public static NominationDto from(Nomination n) {
            return new NominationDto(n.getId(), n.getVoting().getId(), n.getVoting().getName(),
                    n.getNominee() != null ? n.getNominee().getId() : null, n.getNomineeName(),
                    n.getStatement(), n.getBio(), n.getEvidence(), n.getPortfolio(),
                    n.getStatus().name(), n.getRejectionReason(), n.getBlindCode(),
                    n.getVoteCount(), n.getJudgeScore(), n.getSubmittedAt());
        }
    }
    public record NominationCreateRequest(String nomineeName, String statement, String bio,
                                          String evidence, String portfolio) {}
    public record NominationReviewRequest(String status, String reason) {}
    public record NomineeReviewWithNotesRequest(String status, String reason, String internalNotes, boolean escalateToHead) {}

    // ── Vote ──
    public record VoteRequest(String nic, Long nominationId) {}
    public record VoteDto(Long id, Long votingId, String votingName, Long nominationId, String nomineeName,
                          LocalDateTime castedAt) {
        public static VoteDto from(Vote v) {
            return new VoteDto(v.getId(), v.getVoting().getId(), v.getVoting().getName(),
                    v.getNomination().getId(), v.getNomination().getNomineeName(), v.getCastedAt());
        }
    }

    // ── Judging ──
    public record RubricCriterionDto(Long id, String label, String description, String guidance, int maxScore, int sortOrder) {
        public static RubricCriterionDto from(RubricCriterion r) {
            return new RubricCriterionDto(r.getId(), r.getLabel(), r.getDescription(), r.getGuidance(), r.getMaxScore(), r.getSortOrder());
        }
    }
    public record JudgeNomineeDto(Long nominationId, String blindCode, String categoryName, Long votingId,
                                  String votingName, String statement, String evidence, String portfolio,
                                  LocalDateTime submittedAt, String identity) {
        public static JudgeNomineeDto from(Nomination n) {
            return new JudgeNomineeDto(n.getId(), n.getBlindCode(), n.getVoting().getName(),
                    n.getVoting().getId(), n.getVoting().getName(), n.getStatement(), n.getEvidence(),
                    n.getPortfolio(), n.getSubmittedAt(), null);
        }
    }
    public record EvaluationDto(Long nominationId, String status, List<ScoreDto> scores, String comments,
                                String privateNotes, boolean noConflict, int totalScore,
                                LocalDateTime savedAt, LocalDateTime submittedAt) {}
    public record ScoreDto(Long criterionId, int score, String comment) {}
    public record EvaluationSaveRequest(List<ScoreDto> scores, String comments, String privateNotes, boolean noConflict, boolean submit) {}

    // ── Admin ──
    public record AdminUserDto(Long id, String name, String email, String nic, String role, String status,
                               LocalDateTime createdAt, LocalDateTime lastLogin, long voteCount, long nominationCount,
                               boolean banned) {
        public static AdminUserDto from(User u, long voteCount, long nominationCount, boolean banned) {
            return new AdminUserDto(u.getId(), u.getName(), u.getEmail(), u.getNic(), u.getRole().name(),
                    u.getStatus(), u.getCreatedAt(), u.getLastLogin(), voteCount, nominationCount, banned);
        }
    }
    public record UserCreateRequest(String name, String email, String password, String nic, String role) {}
    public record UserStatusRequest(String status) {}
    public record RoleUpdateRequest(String role) {}
    public record BanRequest(String type, String duration, String reason) {}
    public record JudgeAssignRequest(String email, String name, Long votingId) {}
    public record JudgeAssignmentDto(Long id, Long judgeId, String judgeName, String judgeEmail,
                                     Long votingId, String votingName, LocalDateTime addedAt, String status) {
        public static JudgeAssignmentDto from(JudgeAssignment ja) {
            return new JudgeAssignmentDto(ja.getId(),
                    ja.getJudge().getId(), ja.getJudge().getName(), ja.getJudge().getEmail(),
                    ja.getVoting().getId(), ja.getVoting().getName(), ja.getAddedAt(), ja.getStatus());
        }
    }
    public record ResolveRequest(boolean resolved) {}

    // ── Head Organizer & Organizing Team DTOs ──
    public record HeadOrganizerSummaryDto(Long id, String name, String email, String status,
                                         Long votingId, String votingName, String votingStatus,
                                         int teamCount, LocalDateTime createdAt, LocalDateTime lastLogin) {}

    public record HeadOrganizerDetailDto(Long id, String name, String email, String status,
                                        VotingDto voting,
                                        List<OrganizingTeamMemberDto> teamMembers,
                                        List<ContestInvitationDto> pendingInvitations,
                                        List<AuditDto> recentActivity) {}

    public record OrganizingTeamMemberDto(Long id, Long userId, String name, String email,
                                          Long votingId, String votingName, String status,
                                          LocalDateTime addedAt, String addedByName) {
        public static OrganizingTeamMemberDto from(OrganizingTeamMember otm) {
            return new OrganizingTeamMemberDto(
                    otm.getId(),
                    otm.getUser().getId(),
                    otm.getUser().getName(),
                    otm.getUser().getEmail(),
                    otm.getVoting().getId(),
                    otm.getVoting().getName(),
                    otm.getStatus(),
                    otm.getAddedAt(),
                    otm.getAddedBy() != null ? otm.getAddedBy().getName() : "Admin"
            );
        }
    }

    public record InviteHeadOrganizerRequest(String email, Long votingId) {}
    public record AssignHeadOrganizerRequest(Long userId, Long votingId) {}
    public record InviteTeamMemberRequest(String email) {}

    public record ContestInvitationDto(Long id, String token, String email, Long votingId, String votingName,
                                       String role, String status, LocalDateTime createdAt, LocalDateTime expiresAt,
                                       String invitedByName, boolean isExpired) {
        public static ContestInvitationDto from(ContestInvitation inv) {
            return new ContestInvitationDto(
                    inv.getId(),
                    inv.getToken(),
                    inv.getEmail(),
                    inv.getVoting().getId(),
                    inv.getVoting().getName(),
                    inv.getRole().name(),
                    inv.getStatus().name(),
                    inv.getCreatedAt(),
                    inv.getExpiresAt(),
                    inv.getInvitedBy() != null ? inv.getInvitedBy().getName() : "Admin",
                    inv.isExpired()
            );
        }
    }

    public record InviteLookupDto(String token, String email, Long votingId, String votingName,
                                  String role, boolean expired, boolean userExists, String status) {}

    public record AcceptInviteRequest(String password, String name, String nic) {}

    public record ScopedOverviewDto(VotingDto voting,
                                    long nomineeCount,
                                    long voteCount,
                                    int judgeCount,
                                    int teamCount,
                                    List<NominationDto> pendingNominations,
                                    List<AuditDto> recentAudit,
                                    List<SuspiciousDto> recentSuspicious) {}

    public record EscalateSecurityRequest(Long suspiciousId, String reason, String severity) {}

    // ── Feedback / audit / stats ──
    public record FeedbackRequest(Long votingId, int rating, String comment) {}
    public record FeedbackDto(Long id, String authorName, String authorRole, Long votingId, String votingName,
                              int rating, String comment, LocalDateTime submittedAt) {
        public static FeedbackDto from(Feedback f) {
            return new FeedbackDto(f.getId(), f.getAuthorName(), f.getAuthorRole(),
                    f.getVoting() != null ? f.getVoting().getId() : null,
                    f.getVoting() != null ? f.getVoting().getName() : null,
                    f.getRating(), f.getComment(), f.getSubmittedAt());
        }
    }
    public record AuditDto(Long id, LocalDateTime timestamp, String actor, String actorRole, String action,
                           String target, String details, String ip, boolean flagged) {
        public static AuditDto from(AuditEntry a) {
            return new AuditDto(a.getId(), a.getTimestamp(), a.getActor(), a.getActorRole(), a.getAction(),
                    a.getTarget(), a.getDetails(), a.getIp(), a.isFlagged());
        }
    }
    public record SuspiciousDto(Long id, Long userId, String userName, String userEmail, String reason,
                                LocalDateTime detectedAt, String severity, boolean resolved) {
        public static SuspiciousDto from(SuspiciousActivity s) {
            return new SuspiciousDto(s.getId(),
                    s.getUser() != null ? s.getUser().getId() : null,
                    s.getUserName(), s.getUserEmail(), s.getReason(), s.getDetectedAt(),
                    s.getSeverity().name(), s.isResolved());
        }
    }
    public record BanDto(Long id, Long userId, String userName, String userEmail, String type, String duration,
                         String reason, LocalDateTime bannedAt, LocalDateTime expiresAt, boolean active) {
        public static BanDto from(Ban b) {
            return new BanDto(b.getId(), b.getUser().getId(), b.getUser().getName(), b.getUser().getEmail(),
                    b.getType().name(), b.getDuration(), b.getReason(), b.getBannedAt(), b.getExpiresAt(), b.isActive());
        }
    }
    public record WinnerDto(Long votingId, String votingName, String year, String winnerName, long votes, BigDecimal judgeScore, String imageUrl,
                            boolean hasJudging, String judgeWinnerName, BigDecimal judgeWinnerScore) {
        public WinnerDto(Long votingId, String votingName, String year, String winnerName, long votes, BigDecimal judgeScore, String imageUrl) {
            this(votingId, votingName, year, winnerName, votes, judgeScore, imageUrl, false, null, null);
        }
    }
    public record StatsDto(long registeredUsers, long nominations, long categories, long votes, String daysLeft) {}
    public record MessageResponse(String message) {}
}
