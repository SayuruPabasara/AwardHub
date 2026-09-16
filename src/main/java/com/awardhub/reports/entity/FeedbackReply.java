package com.awardhub.reports.entity;

import com.awardhub.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "feedback_reply")
public class FeedbackReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "feedback_id", nullable = false)
    private Feedback feedback;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "replied_by", nullable = false)
    private User repliedBy;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, updatable = false)
    private LocalDateTime repliedAt;

    @PrePersist
    public void onCreate() {
        this.repliedAt = LocalDateTime.now();
    }
}