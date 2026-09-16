package com.awardhub.awardhub.profile.repository;

import com.awardhub.awardhub.user.entity.Nominee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for nominee profile management.
 * Operates on the {@link Nominee} entity (defined in the user module) since
 * a nominee profile IS a nominee — the profile fields are part of the Nominee entity.
 */
@Repository
public interface NomineeProfileRepository extends JpaRepository<Nominee, Long> {
}
