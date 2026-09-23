package com.awardhub.evaluation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

/** One nominee's line in a result set. Every number used in the ranking is stored, not recomputed. */
@Entity
@Table(name = "result_entry")
public class ResultEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_set_id", nullable = false)
    @JsonIgnore
    private ResultSet resultSet;

    @Column(name = "nomination_id", nullable = false)
    private Long nominationId;

    @Column(name = "nominee_name", length = 150)
    private String nomineeName;

    @Column(name = "judge_score", precision = 7, scale = 4)
    private BigDecimal judgeScore;

    @Column(name = "judges_counted")
    private int judgesCounted;

    @Column(name = "vote_count")
    private long voteCount;

    @Column(name = "vote_score", precision = 7, scale = 4)
    private BigDecimal voteScore;

    @Column(name = "final_score", precision = 7, scale = 4)
    private BigDecimal finalScore;

    @Column(name = "rank_position")
    private int rankPosition;

    @Column(nullable = false)
    private boolean winner = false;

    /** Explains how a tie at this position was resolved, e.g. "Tie on final score; higher judge score". */
    @Column(name = "tie_break_note", length = 300)
    private String tieBreakNote;

    /** Set when a nominee could not be ranked, e.g. too few judge submissions. */
    @Column(name = "excluded_reason", length = 200)
    private String excludedReason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ResultSet getResultSet() { return resultSet; }
    public void setResultSet(ResultSet resultSet) { this.resultSet = resultSet; }
    public Long getNominationId() { return nominationId; }
    public void setNominationId(Long nominationId) { this.nominationId = nominationId; }
    public String getNomineeName() { return nomineeName; }
    public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
    public BigDecimal getJudgeScore() { return judgeScore; }
    public void setJudgeScore(BigDecimal judgeScore) { this.judgeScore = judgeScore; }
    public int getJudgesCounted() { return judgesCounted; }
    public void setJudgesCounted(int judgesCounted) { this.judgesCounted = judgesCounted; }
    public long getVoteCount() { return voteCount; }
    public void setVoteCount(long voteCount) { this.voteCount = voteCount; }
    public BigDecimal getVoteScore() { return voteScore; }
    public void setVoteScore(BigDecimal voteScore) { this.voteScore = voteScore; }
    public BigDecimal getFinalScore() { return finalScore; }
    public void setFinalScore(BigDecimal finalScore) { this.finalScore = finalScore; }
    public int getRankPosition() { return rankPosition; }
    public void setRankPosition(int rankPosition) { this.rankPosition = rankPosition; }
    public boolean isWinner() { return winner; }
    public void setWinner(boolean winner) { this.winner = winner; }
    public String getTieBreakNote() { return tieBreakNote; }
    public void setTieBreakNote(String tieBreakNote) { this.tieBreakNote = tieBreakNote; }
    public String getExcludedReason() { return excludedReason; }
    public void setExcludedReason(String excludedReason) { this.excludedReason = excludedReason; }
}
