package com.awardhub.evaluation.model;

import jakarta.persistence.*;

/**
 * PLACEHOLDER - remove this when merging with Nomination Management.
 *
 * Your module only needs three things about a nomination: its id, its category, and the
 * nominee's display name. Until Tharuneth's module exists, this small read-only table
 * lets you develop and demo independently. At merge time, delete this class and point
 * NominationPort at his repository instead.
 */
@Entity
@Table(name = "nomination_ref")
public class NominationRef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "nominee_name", length = 150, nullable = false)
    private String nomineeName;

    /** Only APPROVED nominations are evaluated. */
    @Column(length = 20, nullable = false)
    private String status = "APPROVED";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getNomineeName() { return nomineeName; }
    public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
