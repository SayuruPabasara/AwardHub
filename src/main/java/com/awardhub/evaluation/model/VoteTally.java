package com.awardhub.evaluation.model;

import jakarta.persistence.*;

/**
 * PLACEHOLDER - remove this when merging with Voting Management.
 *
 * The agreed contract with Fernando's module is one number per nomination: the final
 * verified vote count for a closed voting period. Until that exists, this table stands in.
 */
@Entity
@Table(name = "vote_tally",
       uniqueConstraints = @UniqueConstraint(columnNames = "nomination_id"))
public class VoteTally {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nomination_id", nullable = false)
    private Long nominationId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "vote_count", nullable = false)
    private long voteCount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getNominationId() { return nominationId; }
    public void setNominationId(Long nominationId) { this.nominationId = nominationId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public long getVoteCount() { return voteCount; }
    public void setVoteCount(long voteCount) { this.voteCount = voteCount; }
}
