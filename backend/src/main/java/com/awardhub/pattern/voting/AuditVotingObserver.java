package com.awardhub.pattern.voting;

import com.awardhub.entity.User;
import com.awardhub.entity.Voting;
import com.awardhub.service.AuditService;
import org.springframework.stereotype.Component;

/**
 * ConcreteObserver: writes the audit trail whenever a voting changes.
 * Registered on the VotingSubject (Subject) at startup.
 */
@Component
public class AuditVotingObserver implements VotingObserver {

    private final AuditService audit;
    private final VotingSubject subject;

    public AuditVotingObserver(AuditService audit, VotingSubject subject) {
        this.audit = audit;
        this.subject = subject;
        this.subject.addObserver(this);
    }

    @Override
    public void onVotingChanged(Voting voting, String event, User actor, String ip) {
        String id = voting.getId() != null ? String.valueOf(voting.getId()) : "new";
        audit.log(actor, event, "voting-" + id + " / " + voting.getName(),
                "Voting " + event + " (status=" + voting.getStatus() + ")", ip, false);
    }
}
