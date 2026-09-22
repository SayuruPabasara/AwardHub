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

    // ---- Aliases matching the report's "userID" naming, used by the profile module ----

    public Long getUserID() {
        return id;
    }

    public void setUserID(Long id) {
        this.id = id;
    }
}
