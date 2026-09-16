package com.awardhub.nomination.controller;

import com.awardhub.common.response.ApiResponse;
import com.awardhub.nomination.dto.NominationRequestDTO;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.service.NominationService;
import jakarta.validation.Valid;
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

    @PostMapping
    public ResponseEntity<ApiResponse<NominationResponseDTO>> create(
            @Valid @RequestBody NominationRequestDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Nomination created",
                        nominationService.create(dto)
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NominationResponseDTO>>> getAll() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        nominationService.getAll()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NominationResponseDTO>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        nominationService.getById(id)
                )
        );
    }

    @GetMapping("/nominee/{nomineeId}")
    public ResponseEntity<ApiResponse<List<NominationResponseDTO>>> getByNomineeId(
            @PathVariable Long nomineeId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        nominationService.getByNomineeId(nomineeId)
                )
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<NominationResponseDTO>>> getByCategoryId(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        nominationService.getByCategoryId(categoryId)
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<NominationResponseDTO>>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        nominationService.getByStatus(status)
                )
        );
    }
}
