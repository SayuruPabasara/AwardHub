package com.awardhub.profile.entity;

import com.awardhub.user.entity.Nominee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A supporting document a nominee has uploaded to their profile
 * (NIC/passport copy, CV, certificates, etc.).
 *
 * DESIGN NOTE for the team: the requirement-gathering report models
 * "Document" as a weak entity owned by Nomination (documentType is a partial
 * key, identified together with nominationID) — i.e. evidence attached to a
 * specific award nomination, which belongs to Tharuneth's Nomination
 * Management module. This class is a *separate* concept: documents attached
 * directly to the Nominee's profile (identity/CV documents), which is what
 * was asked for in the Nominee Profile Management scope. The two are not the
 * same table and shouldn't be merged without a team decision — flag this at
 * integration time so Nomination-evidence uploads don't collide with this.
 */
@Entity
@Table(name = "nominee_documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NomineeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NomineeDocumentType documentType;

    // Original file name as uploaded by the user (for display/download).
    @Column(nullable = false)
    private String originalFileName;

    // Name of the file as stored on disk (randomized, to avoid collisions/overwrites).
    @Column(nullable = false, unique = true)
    private String storedFileName;

    // e.g. "pdf", "jpg", "png", "docx"
    private String fileFormat;

    // Size in bytes.
    private Long size;

    @Builder.Default
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DocumentVerificationStatus verificationStatus = DocumentVerificationStatus.PENDING;
}
