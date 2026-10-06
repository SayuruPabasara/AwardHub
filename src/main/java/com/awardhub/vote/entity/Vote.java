package com.awardhub.vote.entity;

import com.awardhub.nomination.entity.Nomination;
import com.awardhub.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "votes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_vote_voter_category", columnNames = {"voter_id", "category_id"}),
        @UniqueConstraint(name = "uk_vote_nic_category", columnNames = {"nic", "category_id"})
    },
    indexes = {
        @Index(name = "idx_vote_category", columnList = "category_id"),
        @Index(name = "idx_vote_nomination", columnList = "nomination_id")
    }
)
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    @Column(nullable = false, length = 20)
    private String nic;

    @Column(name = "casted_at", nullable = false)
    private LocalDateTime castedAt = LocalDateTime.now();

    public Vote() {}

    public Vote(Long categoryId, Nomination nomination, User voter, String nic) {
        this.categoryId = categoryId;
        this.nomination = nomination;
        this.voter = voter;
        this.nic = nic;
        this.castedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.castedAt == null) {
            this.castedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
    }

    public User getVoter() {
        return voter;
    }

    public void setVoter(User voter) {
        this.voter = voter;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public LocalDateTime getCastedAt() {
        return castedAt;
    }

    public void setCastedAt(LocalDateTime castedAt) {
        this.castedAt = castedAt;
    }
}
