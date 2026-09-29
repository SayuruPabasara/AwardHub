package com.awardhub.user.repository;

import com.awardhub.common.enums.Role;
import com.awardhub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Case-insensitive email lookup, used by login/registration (email is how
    // people identify their account, and "Jane@x.com" and "jane@x.com" must
    // collide for duplicate-detection purposes).
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    // NIC uniqueness, used at registration and for duplicate-vote prevention.
    boolean existsByNicIgnoreCase(String nic);

    // Added: CategoryService.getAvailableJudges() already called this method
    // before it existed on this interface — was a compile error.
    List<User> findByRole(Role role);
}