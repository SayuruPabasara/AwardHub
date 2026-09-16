package com.awardhub.nomination.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "nominations")
public class Nomination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID of the nominee who submitted the nomination
    @Column(nullable = false)
    private Long nomineeId;

    // ID of the selected award category
    @Column(nullable = false)
    private Long categoryId;

    // Main nomination information
    @Column(nullable = false, length = 10000)
    private String nominationInformation;

    // Supporting document reference
    private String supportingDocument;

    // SUBMITTED, APPROVED, REJECTED, WITHDRAWN
    @Column(nullable = false)
    private String status = "SUBMITTED";

    // Reason provided when the organizer rejects the nomination
    @Column(length = 2000)
    private String rejectionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = "SUBMITTED";
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}