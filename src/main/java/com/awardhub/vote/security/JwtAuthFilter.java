package com.awardhub.vote.security;

import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * INTEGRATION FIX applied here:
 *  - package corrected to com.awardhub.vote.security (previously declared
 *    com.awardhub.security, which didn't match its folder).
 *  - now resolves the authenticated principal as the one shared
 *    user.entity.User via user.repository.UserRepository, instead of the
 *    deleted duplicate com.awardhub.entity.User / com.awardhub.repository.UserRepository.
 *  - this filter existed before but was never registered on the security
 *    filter chain (see SecurityConfig) — it ran, if at all, only when
 *    something explicitly instantiated it. It's now wired via
 *    addFilterBefore(...) so it actually populates the SecurityContext on
 *    every request, which is what every @AuthenticationPrincipal /
 *    @PreAuthorize in the codebase depends on.
 *  - login check uses the richer AccountStatus enum instead of the old
 *    "active" string comparison: only ACTIVE accounts authenticate.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.isValid(token)) {
                String email = jwtService.extractEmail(token);
                User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
                if (user != null && user.isLoginAllowed()) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        chain.doFilter(request, response);
    }
}
