package com.awardhub.pattern.voting;

import com.awardhub.entity.User;
import com.awardhub.entity.Voting;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * OBSERVER SUBJECT + SINGLETON (via Spring container — one shared bean).
 * VotingService notifies; observers (e.g. AuditVotingObserver) react.
 * Lecture: Part I Singleton (single shared instance) + Observer (notifyObservers).
 */
@Component
public class VotingSubject {

    private final List<VotingObserver> observers = new CopyOnWriteArrayList<>();

    public void addObserver(VotingObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(VotingObserver observer) {
        observers.remove(observer);
    }

    public void notifyObservers(Voting voting, String event, User actor, String ip) {
        for (VotingObserver o : observers) {
            o.onVotingChanged(voting, event, actor, ip);
        }
    }
}
