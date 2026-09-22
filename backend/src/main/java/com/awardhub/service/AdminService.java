package com.awardhub.service;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.config.GlobalExceptionHandler.NotFoundException;
import com.awardhub.dto.DTOs.AdminUserDto;
import com.awardhub.dto.DTOs.AuditDto;
import com.awardhub.dto.DTOs.BanRequest;
import com.awardhub.dto.DTOs.BanDto;
import com.awardhub.dto.DTOs.FeedbackDto;
import com.awardhub.dto.DTOs.JudgeAssignRequest;
import com.awardhub.dto.DTOs.JudgeAssignmentDto;
import com.awardhub.dto.DTOs.SuspiciousDto;
import com.awardhub.dto.DTOs.UserCreateRequest;
import com.awardhub.entity.Ban;
import com.awardhub.entity.Feedback;
import com.awardhub.entity.SuspiciousActivity;
import com.awardhub.entity.JudgeAssignment;
import com.awardhub.entity.SuspiciousActivity;
import com.awardhub.entity.User;
import com.awardhub.entity.Voting;
import com.awardhub.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AdminService {

    private static final Pattern DURATION_DAYS = Pattern.compile("(\\d+)\\s*day", Pattern.CASE_INSENSITIVE);

    private final UserRepository users;
    private final VoteRepository votes;
    private final NominationRepository nominations;
    private final BanRepository bans;
    private final SuspiciousActivityRepository suspicious;
    private final JudgeAssignmentRepository assignments;
    private final VotingRepository votings;
    private final AuditRepository auditRepo;
    private final FeedbackRepository feedbackRepo;
    private final PasswordEncoder encoder;
    private final AuditService audit;

    public AdminService(UserRepository users, VoteRepository votes, NominationRepository nominations,
                        BanRepository bans, SuspiciousActivityRepository suspicious,
                        JudgeAssignmentRepository assignments, VotingRepository votings,
                        AuditRepository auditRepo, FeedbackRepository feedbackRepo,
                        PasswordEncoder encoder, AuditService audit) {
        this.users = users;
        this.votes = votes;
        this.nominations = nominations;
        this.bans = bans;
        this.suspicious = suspicious;
        this.assignments = assignments;
        this.votings = votings;
        this.auditRepo = auditRepo;
        this.feedbackRepo = feedbackRepo;
        this.encoder = encoder;
        this.audit = audit;
    }

    // ── Users ──
    @Transactional(readOnly = true)
    public List<AdminUserDto> listUsers() {
        List<AdminUserDto> out = new ArrayList<>();
        for (User u : users.findAll()) {
            out.add(AdminUserDto.from(u,
                    votes.findByVoterId(u.getId()).size(),
                    nominations.findByNomineeId(u.getId()).size(),
                    bans.findFirstByUserIdAndActiveTrueOrderByBannedAtDesc(u.getId()).isPresent()));
        }
        return out;
    }

    @Transactional
    public AdminUserDto createUser(UserCreateRequest req, User actor, String ip) {
        if (req.email() == null || !req.email().contains("@")) throw new BadRequestException("Valid email is required.");
        if (req.password() == null || req.password().length() < 6) throw new BadRequestException("Password must be at least 6 characters.");
        if (users.existsByEmailIgnoreCase(req.email())) throw new BadRequestException("Email already in use.");
        User.Role role;
        try {
            role = User.Role.valueOf(req.role().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + req.role());
        }
        User u = new User();
        u.setName(req.name());
        u.setEmail(req.email().trim());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setNic(req.nic() == null ? "000000000000" : req.nic());
        u.setRole(role);
        users.save(u);
        audit.log(actor, "ACCOUNT_CREATED", "user-" + u.getId() + " / " + u.getName(), "Role: " + role, ip, false);
        return AdminUserDto.from(u, 0, 0, false);
    }

    @Transactional
    public void setUserStatus(Long id, String status, User actor, String ip) {
        User u = findUser(id);
        u.setStatus(status);
        users.save(u);
        audit.log(actor, "ACCOUNT_STATUS_CHANGED", "user-" + id + " / " + u.getName(),
                "Status set to " + status, ip, false);
    }

    @Transactional
    public void setRole(Long id, String role, User actor, String ip) {
        User u = findUser(id);
        try {
            u.setRole(User.Role.valueOf(role.toUpperCase(Locale.ROOT)));
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + role);
        }
        users.save(u);
        audit.log(actor, "ROLE_CHANGED", "user-" + id + " / " + u.getName(), "Role set to " + role, ip, false);
    }

    @Transactional
    public void deleteUser(Long id, User actor, String ip) {
        User u = findUser(id);
        if (u.getId().equals(actor.getId())) throw new BadRequestException("You cannot delete your own account.");
        users.delete(u);
        audit.log(actor, "ACCOUNT_DELETED", "user-" + id + " / " + u.getName(), "User deleted", ip, false);
    }

    // ── Bans ──
    @Transactional(readOnly = true)
    public List<BanDto> listBanDtos() {
        return bans.findAll().stream().map(BanDto::from).toList();
    }

    @Transactional
    public BanDto createBanDto(Long userId, BanRequest req, User actor, String ip) {
        return BanDto.from(createBan(userId, req, actor, ip));
    }

    @Transactional
    public Ban createBan(Long userId, BanRequest req, User actor, String ip) {
        User target = findUser(userId);
        Ban ban = new Ban();
        ban.setUser(target);
        ban.setType("permanent".equalsIgnoreCase(req.type()) ? Ban.Type.permanent : Ban.Type.temporary);
        ban.setDuration(req.duration());
        ban.setReason(req.reason());
        if (ban.getType() == Ban.Type.temporary && req.duration() != null) {
            Matcher m = DURATION_DAYS.matcher(req.duration());
            if (m.find()) {
                ban.setExpiresAt(LocalDateTime.now().plus(Long.parseLong(m.group(1)), ChronoUnit.DAYS));
            }
        }
        if (ban.getType() == Ban.Type.permanent || ban.getExpiresAt() == null
                || ban.getExpiresAt().isAfter(LocalDateTime.now())) {
            target.setStatus("locked");
        }
        bans.save(ban);
        users.save(target);
        audit.log(actor, "USER_BANNED", "user-" + userId + " / " + target.getName(),
                req.type() + " ban. Reason: " + req.reason(), ip, true);
        return ban;
    }

    @Transactional
    public void liftBan(Long banId, User actor, String ip) {
        Ban ban = bans.findById(banId).orElseThrow(() -> new NotFoundException("Ban not found: " + banId));
        ban.setActive(false);
        bans.save(ban);
        User target = ban.getUser();
        target.setStatus("active");
        users.save(target);
        audit.log(actor, "BAN_LIFTED", "user-" + target.getId() + " / " + target.getName(), "Ban lifted", ip, false);
    }

    // ── Suspicious activity ──
    @Transactional(readOnly = true)
    public List<SuspiciousDto> listSuspiciousDtos() {
        return suspicious.findAllByOrderByDetectedAtDesc().stream().map(SuspiciousDto::from).toList();
    }

    /** Manual flag of suspicious activity, mapped/saved inside a transaction. */
    @Transactional
    public Map<String, Object> flagSuspicious(Long userId, String reason, String severity) {
        User target = userId != null ? users.findById(userId).orElse(null) : null;
        SuspiciousActivity s = new SuspiciousActivity();
        s.setUser(target);
        s.setUserName(target != null ? target.getName() : "Unknown");
        s.setUserEmail(target != null ? target.getEmail() : "unknown");
        s.setReason(reason);
        try {
            s.setSeverity(SuspiciousActivity.Severity.valueOf(severity == null ? "low" : severity));
        } catch (Exception ignored) {
            s.setSeverity(SuspiciousActivity.Severity.low);
        }
        suspicious.save(s);
        return Map.of("id", s.getId());
    }

    @Transactional
    public void resolveSuspicious(Long id, boolean resolved, User actor, String ip) {
        SuspiciousActivity s = suspicious.findById(id)
                .orElseThrow(() -> new NotFoundException("Suspicious activity not found: " + id));
        s.setResolved(resolved);
        suspicious.save(s);
        audit.log(actor, "SUSPICIOUS_RESOLVED", "suspicious-" + id, "Resolved: " + resolved, ip, false);
    }

    // ── Judge assignments ──
    @Transactional(readOnly = true)
    public List<JudgeAssignmentDto> listAssignments(Long votingId) {
        List<JudgeAssignment> list = votingId == null ? assignments.findAll() : assignments.findByVotingId(votingId);
        return list.stream().map(JudgeAssignmentDto::from).toList();
    }

    @Transactional
    public JudgeAssignmentDto assignJudgeDto(JudgeAssignRequest req, User actor, String ip) {
        return JudgeAssignmentDto.from(assignJudge(req, actor, ip));
    }

    @Transactional
    public JudgeAssignment assignJudge(JudgeAssignRequest req, User actor, String ip) {
        User judge = users.findByEmailIgnoreCase(req.email() == null ? "" : req.email())
                .orElseThrow(() -> new NotFoundException("No user with email " + req.email() + " — create the judge account first."));
        Voting voting = votings.findById(req.votingId())
                .orElseThrow(() -> new NotFoundException("Voting not found: " + req.votingId()));
        if (assignments.existsByJudgeIdAndVotingId(judge.getId(), voting.getId())) {
            throw new BadRequestException(judge.getName() + " is already assigned to " + voting.getName() + ".");
        }
        if (judge.getRole() != User.Role.JUDGE) {
            judge.setRole(User.Role.JUDGE);
            users.save(judge);
        }
        JudgeAssignment ja = new JudgeAssignment();
        ja.setJudge(judge);
        ja.setVoting(voting);
        assignments.save(ja);
        audit.log(actor, "JUDGE_ASSIGNED", judge.getName() + " → " + voting.getName(), "Judge assigned to voting", ip, false);
        return ja;
    }

    @Transactional
    public void removeAssignment(Long id, User actor, String ip) {
        JudgeAssignment ja = assignments.findById(id)
                .orElseThrow(() -> new NotFoundException("Assignment not found: " + id));
        assignments.delete(ja);
        audit.log(actor, "JUDGE_REMOVED", ja.getJudge().getName() + " → " + ja.getVoting().getName(), "Judge assignment removed", ip, false);
    }

    // ── Reads ──
    @Transactional(readOnly = true)
    public List<AuditDto> auditLog() {
        return auditRepo.findAllByOrderByTimestampDesc().stream().map(AuditDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> feedback() {
        return feedbackRepo.findAllByOrderBySubmittedAtDesc().stream().map(FeedbackDto::from).toList();
    }

    private User findUser(Long id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}
