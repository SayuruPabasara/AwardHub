package com.awardhub.nomination.controller;

import com.awardhub.nomination.dto.NominationRequestDTO;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.service.NominationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nominations")
public class NominationController {

    private final NominationService nominationService;

    public NominationController(NominationService nominationService) {
        this.nominationService = nominationService;
    }

    // Create
    @PostMapping
    public ResponseEntity<NominationResponseDTO> createNomination(
            @RequestBody NominationRequestDTO request) {

        return ResponseEntity.ok(
                nominationService.createNomination(request)
        );
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<NominationResponseDTO>> getAllNominations() {

        return ResponseEntity.ok(
                nominationService.getAllNominations()
        );
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<NominationResponseDTO> getNominationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                nominationService.getNominationById(id)
        );
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<NominationResponseDTO> updateNomination(
            @PathVariable Long id,
            @RequestBody NominationRequestDTO request) {

        return ResponseEntity.ok(
                nominationService.updateNomination(id, request)
        );
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNomination(
            @PathVariable Long id) {

        nominationService.deleteNomination(id);

        return ResponseEntity.noContent().build();
    }
}