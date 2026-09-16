package com.awardhub.awardhub.profile.service;

import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.profile.dto.NomineeProfileResponse;
import com.awardhub.awardhub.profile.dto.UpdateNomineeProfileRequest;
import com.awardhub.awardhub.profile.repository.NomineeProfileRepository;
import com.awardhub.awardhub.user.entity.Nominee;
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

        if (req.getContactNumber() != null) nominee.setContactNumber(req.getContactNumber());
        if (req.getNicPassport() != null) nominee.setNicPassport(req.getNicPassport());
        if (req.getDateOfBirth() != null) nominee.setDateOfBirth(req.getDateOfBirth());
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
