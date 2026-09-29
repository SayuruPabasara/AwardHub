package com.awardhub.user.entity;

import com.awardhub.common.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * User — superclass of the ISA hierarchy (Nominee, Voter, Judge, AwardOrganizer,
 * SystemAdministrator). Uses JOINED inheritance: each subclass gets its own table
 * whose primary key is also a foreign key back to users.id, matching the
 * "nomineeID PK, FK -> User" style keys in the requirement-gathering report.
 *
 * NOTE for the team: this entity still carries `username`, `role`, `fullName` and
 * `active` from the original scaffold, which the requirement report does not list
 * on User (the report expects the concrete subclass + accountStatus to convey
 * identity/role/state instead). Left in place since other members' modules may
 * already depend on them — worth a shared decision before Sprint integration on
 * whether `role` stays or is fully replaced by the subclass discriminator.
 *
 * MERGE NOTE (integration fix): the vote module had built a second, unrelated
 * `User` entity also mapped to table "users" (com.awardhub.entity.User), with
 * its own `passwordHash`/`nic`/`bio`/notification-preference fields and its own
 * 9-value Role enum. Two entities mapped to one table is not something Hibernate
 * can reconcile, so that copy has been deleted and every field it needed for
 * auth/admin/self-service has been folded into this class instead:
 *   - `nic`            -> national ID, used for voter identity verification
 *   - `bio`/`location`/`website`/`avatar` -> public profile fields
 *   - `notifEmail`/`notifSms`/`notifResults` -> notification preferences
 *   - `lastLogin`      -> set on successful login
 * `password` (already present) is reused in place of the old `passwordHash` name;
 * all rewritten auth code below calls getPassword()/setPassword().
 * `accountStatus` (already present) replaces the vote module's plain
 * active/inactive/locked string — ACTIVE / SUSPENDED / DEACTIVATED map onto it.
 */
@Data
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String fullName;

    private Boolean active = true;

    // ---- Fields from the requirement-gathering report's User entity ----

    private String contactNumber;

    private LocalDateTime registrationDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;

    // ---- Folded in from the vote module's now-deleted duplicate User entity ----

    @Column(unique = true, length = 20)
    private String nic;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String location;

    private String website;

    @Column(length = 4)
    private String avatar;

    private boolean notifEmail = true;

    private boolean notifSms = false;

    private boolean notifResults = true;

    private LocalDateTime lastLogin;

    // ---- Aliases matching the report's "userID" naming, used by the profile module ----

    public Long getUserID() {
        return id;
    }

    public void setUserID(Long id) {
        this.id = id;
    }

    // ---- Convenience helper used by the rewritten auth/security code ----

    /** True only for an account that is allowed to authenticate. */
    public boolean isLoginAllowed() {
        return accountStatus == AccountStatus.ACTIVE;
    }
}
