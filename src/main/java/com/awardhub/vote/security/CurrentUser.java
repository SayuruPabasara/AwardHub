package com.awardhub.vote.security;

import com.awardhub.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * INTEGRATION FIX: package corrected to com.awardhub.vote.security (was
 * com.awardhub.security), and returns the one shared user.entity.User
 * instead of the deleted duplicate com.awardhub.entity.User.
 *
 * Note: most other modules (profile, category) use Spring's own
 * @AuthenticationPrincipal instead of this helper — they resolve to the
 * exact same principal now that JwtAuthFilter authenticates as
 * user.entity.User everywhere, so either style works. Kept for vote's
 * existing controllers to avoid touching more files than necessary.
 */
public final class CurrentUser {
    private CurrentUser() {}

    public static User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u;
        }
        return null;
    }
}
