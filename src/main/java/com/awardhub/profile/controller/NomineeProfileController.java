package com.awardhub.profile.controller;

import com.awardhub.common.dto.ApiResponse;
import com.awardhub.profile.dto.NomineeProfileResponse;
import com.awardhub.profile.dto.UpdateNomineeProfileRequest;
import com.awardhub.profile.service.NomineeProfileService;
import com.awardhub.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile/nominee")
public class NomineeProfileController {

    private final NomineeProfileService profileService;

    public NomineeProfileController(NomineeProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NomineeProfileResponse>> getMyProfile(
            @AuthenticationPrincipal User user
    ) {
        NomineeProfileResponse profile = profileService.getProfile(user.getUserID());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NomineeProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateNomineeProfileRequest request,
            @AuthenticationPrincipal User user
    ) {
        NomineeProfileResponse updated = profileService.updateProfile(user.getUserID(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NomineeProfileResponse>> getProfileById(@PathVariable Long id) {
        NomineeProfileResponse profile = profileService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
