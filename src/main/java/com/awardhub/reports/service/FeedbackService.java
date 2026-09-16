package com.awardhub.reports.service;

import com.awardhub.common.enums.FeedbackStatus;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.reports.dto.FeedbackRequestDTO;
import com.awardhub.reports.dto.FeedbackResponseDTO;
import com.awardhub.reports.dto.ReplyResponseDTO;
import com.awardhub.reports.entity.Feedback;
import com.awardhub.reports.repository.FeedbackRepository;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    // ---------- Allowed status transitions ----------
    private static final Map<FeedbackStatus, List<FeedbackStatus>> VALID_TRANSITIONS = Map.of(
            FeedbackStatus.OPEN,         List.of(FeedbackStatus.IN_PROGRESS, FeedbackStatus.RESOLVED, FeedbackStatus.CLOSED),
            FeedbackStatus.IN_PROGRESS,  List.of(FeedbackStatus.RESOLVED, FeedbackStatus.CLOSED),
            FeedbackStatus.RESOLVED,     List.of(FeedbackStatus.CLOSED),
            FeedbackStatus.CLOSED,       List.of()
    );

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public FeedbackResponseDTO submit(FeedbackRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Feedback fb = new Feedback();
        fb.setUser(user);
        fb.setSubject(dto.getSubject());
        fb.setMessage(dto.getMessage());
        fb.setFeedbackType(dto.getFeedbackType());
        fb.setRating(dto.getRating());
        fb.setCategoryId(dto.getCategoryId());

        return toDTO(feedbackRepository.save(fb));
    }

    public List<FeedbackResponseDTO> getAll() {
        return feedbackRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getByUser(Long userId) {
        return feedbackRepository.findByUserId(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getByStatus(FeedbackStatus status) {
        return feedbackRepository.findByStatus(status)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public FeedbackResponseDTO updateStatus(Long id, FeedbackStatus newStatus) {
        Feedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        FeedbackStatus currentStatus = fb.getStatus();

        // Allow same-status update (no-op)
        if (currentStatus != newStatus) {
            List<FeedbackStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
            if (!allowed.contains(newStatus)) {
                throw new IllegalArgumentException(
                        "Invalid status transition: " + currentStatus + " → " + newStatus);
            }
        }

        fb.setStatus(newStatus);
        return toDTO(feedbackRepository.save(fb));
    }

    // ---------- Mapper ----------
    private FeedbackResponseDTO toDTO(Feedback fb) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(fb.getId());
        dto.setUserId(fb.getUser().getId());
        dto.setUsername(fb.getUser().getUsername());
        dto.setSubject(fb.getSubject());
        dto.setMessage(fb.getMessage());
        dto.setFeedbackType(fb.getFeedbackType());
        dto.setStatus(fb.getStatus());
        dto.setRating(fb.getRating());
        dto.setCategoryId(fb.getCategoryId());
        dto.setCreatedAt(fb.getCreatedAt());
        dto.setUpdatedAt(fb.getUpdatedAt());

        if (fb.getReplies() != null) {
            dto.setReplies(fb.getReplies().stream().map(r -> {
                ReplyResponseDTO rd = new ReplyResponseDTO();
                rd.setId(r.getId());
                rd.setRepliedById(r.getRepliedBy().getId());
                rd.setRepliedByName(r.getRepliedBy().getUsername());
                rd.setMessage(r.getMessage());
                rd.setRepliedAt(r.getRepliedAt());
                return rd;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}