package com.awardhub.service;

import com.awardhub.entity.AuditEntry;
import com.awardhub.entity.SuspiciousActivity;
import com.awardhub.entity.User;
import com.awardhub.repository.AuditRepository;
import com.awardhub.repository.SuspiciousActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final SuspiciousActivityRepository suspicious;

    public AuditService(AuditRepository auditRepository, SuspiciousActivityRepository suspicious) {
        this.auditRepository = auditRepository;
        this.suspicious = suspicious;
    }

    /**
     * REQUIRES_NEW so security-relevant records commit even when the caller's
     * transaction is rolled back by the exception that follows the log call.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(User actor, String action, String target, String details, String ip, boolean flagged) {
        AuditEntry entry = new AuditEntry();
        entry.setActor(actor != null ? actor.getName() : "anonymous");
        entry.setActorRole(actor != null ? actor.getRole().name() : "ANONYMOUS");
        entry.setAction(action);
        entry.setTarget(target);
        entry.setDetails(details);
        entry.setIp(ip != null ? ip : "unknown");
        entry.setFlagged(flagged);
        auditRepository.save(entry);
    }

    /** Suspicious-activity flag that commits independently of the caller's transaction. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void flag(User actor, String reason, SuspiciousActivity.Severity severity) {
        SuspiciousActivity s = new SuspiciousActivity();
        s.setUser(actor);
        s.setUserName(actor != null ? actor.getName() : "Unknown");
        s.setUserEmail(actor != null ? actor.getEmail() : "unknown");
        s.setReason(reason);
        s.setSeverity(severity);
        suspicious.save(s);
    }
}
