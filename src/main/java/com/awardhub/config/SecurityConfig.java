package com.awardhub.config;

import com.awardhub.vote.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * @EnableMethodSecurity turns on @PreAuthorize checks (e.g. hasRole('NOMINEE'))
 * on controller methods. Without it, those annotations are silently ignored.
 *
 * INTEGRATION FIX: this class previously had (a) no PasswordEncoder bean, even
 * though AuthService/AdminService both require one to be injected, so the
 * application context could never start, and (b) a JwtAuthFilter class that
 * existed but was never added to the filter chain, so nothing ever populated
 * the SecurityContext — every @AuthenticationPrincipal in the codebase would
 * have resolved to null even after (a) was fixed. Both are addressed here.
 *
 * `authorizeHttpRequests` is deliberately left permissive at the HTTP layer:
 * this app enforces authorization with @PreAuthorize at the method layer
 * (role checks) plus ownership checks inside services (e.g.
 * NomineeDocumentService.getOwnedDocument). If the team later wants
 * defense-in-depth at the HTTP layer too, tighten `.anyRequest()` here.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}