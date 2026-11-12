package com.awardhub.profile.service;

import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.profile.dto.NomineeProfileResponse;
import com.awardhub.profile.dto.UpdateNomineeProfileRequest;
import com.awardhub.profile.repository.NomineeProfileRepository;
import com.awardhub.user.entity.Nominee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NomineeProfileService {

    private final NomineeProfileRepository nomineeRepository;
    private final AuditLogService auditLogService;

    public NomineeProfileService(NomineeProfileRepository nomineeRepository, AuditLogService auditLogService) {
        this.nomineeRepository = nomineeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public NomineeProfileResponse getProfile(Long userId) {
        Nominee nominee = nomineeRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee profile not found for ID: " + userId));
        return NomineeProfileResponse.fromEntity(nominee);
    }

    @Transactional
    public NomineeProfileResponse updateProfile(Long userId, UpdateNomineeProfileRequest req) {
        Nominee nominee = nomineeRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee profile not found for ID: " + userId));

        if (req.getFullName() != null) {
            String name = req.getFullName().trim();
            if (!name.isEmpty()) {
                nominee.setFullName(name);
            }
        }
        if (req.getWebsite() != null) {
            nominee.setWebsite(req.getWebsite().trim());
        }
        if (req.getContactNumber() != null) {
            nominee.setContactNumber(req.getContactNumber().trim());
        }
        if (req.getNicPassport() != null) {
            String nic = req.getNicPassport().trim();
            if (!nic.isEmpty() && !nic.matches("^[A-Za-z0-9\\-]{5,20}$")) {
                throw new IllegalArgumentException("Invalid NIC or Passport format (must be 5-20 alphanumeric characters or hyphens)");
            }
            nominee.setNicPassport(nic);
        }
        if (req.getDateOfBirth() != null && !req.getDateOfBirth().trim().isEmpty()) {
            String dobStr = req.getDateOfBirth().trim();
            try {
                java.time.LocalDate dob = java.time.LocalDate.parse(dobStr);
                java.time.LocalDate today = java.time.LocalDate.now();
                if (!dob.isBefore(today)) {
                    throw new IllegalArgumentException("Date of birth must be a past date");
                }
                if (dob.isAfter(today.minusYears(18))) {
                    throw new IllegalArgumentException("Nominee must be at least 18 years of age");
                }
            } catch (java.time.format.DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid date of birth format. Please use YYYY-MM-DD");
            }
            nominee.setDateOfBirth(dobStr);
        }
        if (req.getGender() != null) nominee.setGender(req.getGender());
        if (req.getStreet() != null) nominee.setStreet(req.getStreet());
        if (req.getCity() != null) nominee.setCity(req.getCity());
        if (req.getState() != null) nominee.setState(req.getState());
        if (req.getZip() != null) nominee.setZip(req.getZip());
        if (req.getOrganization() != null) nominee.setOrganization(req.getOrganization());
        if (req.getJobTitle() != null) nominee.setJobTitle(req.getJobTitle());
        if (req.getBiography() != null) nominee.setBiography(req.getBiography());
        if (req.getEducation() != null) nominee.setEducation(req.getEducation());
        if (req.getAchievements() != null) nominee.setAchievements(req.getAchievements());
        if (req.getReferences() != null) nominee.setReferences(req.getReferences());

        Nominee saved = nomineeRepository.save(nominee);
        auditLogService.log(userId, "UPDATE_PROFILE", "Nominee", userId, "Updated nominee profile details");
        return NomineeProfileResponse.fromEntity(saved);
    }
}
