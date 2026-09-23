package com.awardhub.user.service;

import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.security.JwtTokenProvider;
import com.awardhub.user.dto.LoginRequest;
import com.awardhub.user.dto.LoginResponse;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        // Verify BCrypt hashed password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Password mismatch for email: {}", request.getEmail());
            throw new BadRequestException("Invalid email or password.");
        }

        if (user.getRole() == null) {
            log.warn("User has no assigned role: {}", user.getEmail());
            throw new BadRequestException("Access denied. User has no assigned role.");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );

        log.info("Login successful for user: {} with role: {}", user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    @Transactional(readOnly = true)
    public LoginResponse getCurrentOrganizer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return new LoginResponse(null, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
