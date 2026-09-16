package com.awardhub.nomination.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NominationRequestDTO {

    @NotNull(message = "Nominee ID is required")
    private Long nomineeId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Nomination information is required")
    @Size(max = 10000, message = "Nomination information must not exceed 10000 characters")
    private String nominationInformation;

    private String supportingDocument;
}
