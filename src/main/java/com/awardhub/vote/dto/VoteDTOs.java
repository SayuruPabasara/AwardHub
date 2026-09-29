package com.awardhub.vote.dto;

import com.awardhub.vote.entity.Vote;

import java.time.LocalDateTime;

public final class VoteDTOs {

    private VoteDTOs() {}

    public record VoteRequest(String nic, Long nominationId) {}

    public record VoteDto(
            Long id,
            Long categoryId,
            Long nominationId,
            String nomineeTitle,
            LocalDateTime castedAt
    ) {
        public static VoteDto from(Vote v) {
            return new VoteDto(
                    v.getId(),
                    v.getCategoryId(),
                    v.getNomination() != null ? v.getNomination().getId() : null,
                    v.getNomination() != null ? v.getNomination().getTitle() : null,
                    v.getCastedAt()
            );
        }

        // Aliases for compatibility
        public Long votingId() {
            return categoryId;
        }

        public String nomineeName() {
            return nomineeTitle;
        }
    }

    public record MessageResponse(String message) {}
}
