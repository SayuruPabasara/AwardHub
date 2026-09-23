package com.awardhub.nomination.service;

import com.awardhub.nomination.dto.NominationRequestDTO;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NominationService {

    private final NominationRepository nominationRepository;

    public NominationService(NominationRepository nominationRepository) {
        this.nominationRepository = nominationRepository;
    }

    // Create
    public NominationResponseDTO createNomination(NominationRequestDTO request) {
        Nomination nomination = new Nomination();

        nomination.setCategoryId(request.getCategoryId());
        nomination.setNomineeId(request.getNomineeId());
        nomination.setTitle(request.getTitle());
        nomination.setDescription(request.getDescription());
        nomination.setSupportingDocument(request.getSupportingDocument());
        nomination.setStatus(request.getStatus());
        nomination.setRejectionReason(request.getRejectionReason());

        Nomination saved = nominationRepository.save(nomination);

        return convertToResponse(saved);
    }

    // Read all
    public List<NominationResponseDTO> getAllNominations() {
        return nominationRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Read by ID
    public NominationResponseDTO getNominationById(Long id) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Nomination not found"));

        return convertToResponse(nomination);
    }

    // Update
    public NominationResponseDTO updateNomination(
            Long id,
            NominationRequestDTO request) {

        Nomination existing = nominationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Nomination not found"));

        existing.setCategoryId(request.getCategoryId());
        existing.setNomineeId(request.getNomineeId());
        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setSupportingDocument(request.getSupportingDocument());
        existing.setStatus(request.getStatus());
        existing.setRejectionReason(request.getRejectionReason());

        Nomination updated = nominationRepository.save(existing);

        return convertToResponse(updated);
    }

    // Delete
    public void deleteNomination(Long id) {

        if (!nominationRepository.existsById(id)) {
            throw new RuntimeException("Nomination not found");
        }

        nominationRepository.deleteById(id);
    }

    // Convert entity to response DTO
    private NominationResponseDTO convertToResponse(Nomination nomination) {

        NominationResponseDTO response = new NominationResponseDTO();

        response.setId(nomination.getId());
        response.setCategoryId(nomination.getCategoryId());
        response.setNomineeId(nomination.getNomineeId());
        response.setTitle(nomination.getTitle());
        response.setDescription(nomination.getDescription());
        response.setSupportingDocument(nomination.getSupportingDocument());
        response.setStatus(nomination.getStatus());
        response.setRejectionReason(nomination.getRejectionReason());
        response.setCreatedAt(nomination.getCreatedAt());
        response.setUpdatedAt(nomination.getUpdatedAt());

        return response;
    }
}