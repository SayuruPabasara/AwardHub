package com.awardhub.nomination.service;

import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.nomination.dto.NominationRequestDTO;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NominationService {

    private final NominationRepository nominationRepository;

    public NominationService(NominationRepository nominationRepository) {
        this.nominationRepository = nominationRepository;
    }

    public NominationResponseDTO create(NominationRequestDTO dto) {
        Nomination nomination = new Nomination();

        nomination.setNomineeId(dto.getNomineeId());
        nomination.setCategoryId(dto.getCategoryId());
        nomination.setNominationInformation(dto.getNominationInformation());
        nomination.setSupportingDocument(dto.getSupportingDocument());
        nomination.setStatus("SUBMITTED");

        return toDTO(nominationRepository.save(nomination));
    }

    public List<NominationResponseDTO> getAll() {
        return nominationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NominationResponseDTO getById(Long id) {
        Nomination nomination = nominationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Nomination not found"));

        return toDTO(nomination);
    }

    public List<NominationResponseDTO> getByNomineeId(Long nomineeId) {
        return nominationRepository.findByNomineeId(nomineeId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NominationResponseDTO> getByCategoryId(Long categoryId) {
        return nominationRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NominationResponseDTO> getByStatus(String status) {
        return nominationRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private NominationResponseDTO toDTO(Nomination nomination) {
        NominationResponseDTO dto = new NominationResponseDTO();

        dto.setId(nomination.getId());
        dto.setNomineeId(nomination.getNomineeId());
        dto.setCategoryId(nomination.getCategoryId());
        dto.setNominationInformation(nomination.getNominationInformation());
        dto.setSupportingDocument(nomination.getSupportingDocument());
        dto.setStatus(nomination.getStatus());
        dto.setRejectionReason(nomination.getRejectionReason());
        dto.setCreatedAt(nomination.getCreatedAt());
        dto.setUpdatedAt(nomination.getUpdatedAt());

        return dto;
    }
}
