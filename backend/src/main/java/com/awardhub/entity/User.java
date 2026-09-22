package com.awardhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String nic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(nullable = false, length = 10)
    private String status = "active";

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String bio;

    private String location;

    private String website;

    @Column(length = 4)
    private String avatar;

    @Column(name = "notif_email", nullable = false)
    private boolean notifEmail = true;

    @Column(name = "notif_sms", nullable = false)
    private boolean notifSms = false;

    @Column(name = "notif_results", nullable = false)
    private boolean notifResults = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public enum Role { VOTER, NOMINEE, JUDGE, ORGANIZER, IT_COORDINATOR, AUDIT, ADMIN, HEAD_ORGANIZER, ORGANIZING_TEAM_MEMBER }

    public boolean isAdmin() { return role == Role.ADMIN; }
    public boolean isJudge() { return role == Role.JUDGE; }
    public boolean isHeadOrganizer() { return role == Role.HEAD_ORGANIZER; }
    public boolean isOrganizingTeam() { return role == Role.ORGANIZING_TEAM_MEMBER; }

    // ── getters/setters ──
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public boolean isNotifEmail() { return notifEmail; }
    public void setNotifEmail(boolean notifEmail) { this.notifEmail = notifEmail; }
    public boolean isNotifSms() { return notifSms; }
    public void setNotifSms(boolean notifSms) { this.notifSms = notifSms; }
    public boolean isNotifResults() { return notifResults; }
    public void setNotifResults(boolean notifResults) { this.notifResults = notifResults; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
