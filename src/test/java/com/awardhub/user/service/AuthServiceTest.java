package com.awardhub.user.service;

import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.security.JwtTokenProvider;
import com.awardhub.user.dto.LoginRequest;
import com.awardhub.user.dto.LoginResponse;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User organizerUser;
    private User voterUser;

    @BeforeEach
    void setUp() {
        organizerUser = new User(
                1L,
                "organizer@awardhub.com",
                "$2a$10$hashedOrganizerPassword",
                "Award Organizer",
                Role.AWARD_ORGANIZER
        );

        voterUser = new User(
                2L,
                "voter@awardhub.com",
                "$2a$10$hashedVoterPassword",
                "Public Voter",
                Role.VOTER
        );
    }

    @Test
    @DisplayName("Login Success - Valid Organizer Credentials")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("organizer@awardhub.com", "Organizer@123");

        when(userRepository.findByEmail("organizer@awardhub.com")).thenReturn(Optional.of(organizerUser));
        when(passwordEncoder.matches("Organizer@123", organizerUser.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateToken(1L, "organizer@awardhub.com", "Award Organizer", Role.AWARD_ORGANIZER))
                .thenReturn("mocked.jwt.token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("organizer@awardhub.com", response.getEmail());
        assertEquals(Role.AWARD_ORGANIZER, response.getRole());
    }

    @Test
    @DisplayName("Login Failure - Wrong Password")
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest("organizer@awardhub.com", "WrongPassword");

        when(userRepository.findByEmail("organizer@awardhub.com")).thenReturn(Optional.of(organizerUser));
        when(passwordEncoder.matches("WrongPassword", organizerUser.getPassword())).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(request));
        assertEquals("Invalid email or password.", ex.getMessage());
        verify(jwtTokenProvider, never()).generateToken(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Login Failure - Email Not Found")
    void testLogin_EmailNotFound() {
        LoginRequest request = new LoginRequest("unknown@awardhub.com", "Organizer@123");

        when(userRepository.findByEmail("unknown@awardhub.com")).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(request));
        assertEquals("Invalid email or password.", ex.getMessage());
    }

    @Test
    @DisplayName("Login Success - Valid Voter Credentials")
    void testLogin_VoterSuccess() {
        LoginRequest request = new LoginRequest("voter@awardhub.com", "Voter@123");

        when(userRepository.findByEmail("voter@awardhub.com")).thenReturn(Optional.of(voterUser));
        when(passwordEncoder.matches("Voter@123", voterUser.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateToken(2L, "voter@awardhub.com", "Public Voter", Role.VOTER))
                .thenReturn("mocked.voter.jwt.token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.voter.jwt.token", response.getToken());
        assertEquals("voter@awardhub.com", response.getEmail());
        assertEquals(Role.VOTER, response.getRole());
    }

    @Test
    @DisplayName("Login Failure - User Has No Assigned Role")
    void testLogin_NoRole() {
        User userWithoutRole = new User(3L, "norole@awardhub.com", "hash", "No Role", null);
        LoginRequest request = new LoginRequest("norole@awardhub.com", "Password@123");

        when(userRepository.findByEmail("norole@awardhub.com")).thenReturn(Optional.of(userWithoutRole));
        when(passwordEncoder.matches("Password@123", "hash")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("User has no assigned role"));
        verify(jwtTokenProvider, never()).generateToken(any(), any(), any(), any());
    }
}
