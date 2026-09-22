package com.awardhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voting_id")
    private Voting voting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nomination_id")
    private Nomination nomination;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voter_id")
    private User voter;

    @Column(nullable = false, length = 20)
    private String nic;

    @Column(name = "casted_at", nullable = false)
    private LocalDateTime castedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Voting getVoting() { return voting; }
    public void setVoting(Voting voting) { this.voting = voting; }
    public Nomination getNomination() { return nomination; }
    public void setNomination(Nomination nomination) { this.nomination = nomination; }
    public User getVoter() { return voter; }
    public void setVoter(User voter) { this.voter = voter; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public LocalDateTime getCastedAt() { return castedAt; }
    public void setCastedAt(LocalDateTime castedAt) { this.castedAt = castedAt; }
}
