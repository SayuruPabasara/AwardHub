package com.awardhub.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "votings")
public class Voting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String eligibility;

    @Column(name = "image_url", length = 400)
    private String imageUrl;

    @Column(name = "has_judging", nullable = false)
    private boolean hasJudging = false;

    @Column(name = "nomination_start")
    private LocalDate nominationStart;

    @Column(name = "nomination_end")
    private LocalDate nominationEnd;

    @Column(name = "voting_start")
    private LocalDate votingStart;

    @Column(name = "voting_end")
    private LocalDate votingEnd;

    @Column(name = "judging_start")
    private LocalDate judgingStart;

    @Column(name = "judging_end")
    private LocalDate judgingEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Status status = Status.draft;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_nomination_id")
    private Nomination winner;

    /** Winner chosen by the judge panel (highest average rubric score). Only
     *  used for contests with rubric judging enabled. The public/”most popular”
     *  winner stays in {@link #winner}. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_winner_nomination_id")
    private Nomination judgeWinner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_organizer_id")
    private User headOrganizer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { draft, upcoming, collecting, voting, judging, ended, archived }

    // ── getters/setters ──
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isHasJudging() { return hasJudging; }
    public void setHasJudging(boolean hasJudging) { this.hasJudging = hasJudging; }
    public LocalDate getNominationStart() { return nominationStart; }
    public void setNominationStart(LocalDate nominationStart) { this.nominationStart = nominationStart; }
    public LocalDate getNominationEnd() { return nominationEnd; }
    public void setNominationEnd(LocalDate nominationEnd) { this.nominationEnd = nominationEnd; }
    public LocalDate getVotingStart() { return votingStart; }
    public void setVotingStart(LocalDate votingStart) { this.votingStart = votingStart; }
    public LocalDate getVotingEnd() { return votingEnd; }
    public void setVotingEnd(LocalDate votingEnd) { this.votingEnd = votingEnd; }
    public LocalDate getJudgingStart() { return judgingStart; }
    public void setJudgingStart(LocalDate judgingStart) { this.judgingStart = judgingStart; }
    public LocalDate getJudgingEnd() { return judgingEnd; }
    public void setJudgingEnd(LocalDate judgingEnd) { this.judgingEnd = judgingEnd; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Nomination getWinner() { return winner; }
    public void setWinner(Nomination winner) { this.winner = winner; }
    public Nomination getJudgeWinner() { return judgeWinner; }
    public void setJudgeWinner(Nomination judgeWinner) { this.judgeWinner = judgeWinner; }
    public User getHeadOrganizer() { return headOrganizer; }
    public void setHeadOrganizer(User headOrganizer) { this.headOrganizer = headOrganizer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
