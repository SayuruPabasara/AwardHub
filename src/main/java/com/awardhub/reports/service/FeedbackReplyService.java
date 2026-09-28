package com.awardhub.reports.service;

import com.awardhub.common.enums.FeedbackStatus;
import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.reports.dto.ReplyRequestDTO;
import com.awardhub.reports.dto.ReplyResponseDTO;
import com.awardhub.reports.entity.Feedback;
import com.awardhub.reports.entity.FeedbackReply;
import com.awardhub.reports.repository.FeedbackReplyRepository;
import com.awardhub.reports.repository.FeedbackRepository;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackReplyService {

    private final FeedbackReplyRepository replyRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackReplyService(FeedbackReplyRepository replyRepository,
                                FeedbackRepository feedbackRepository,
                                UserRepository userRepository) {
        this.replyRepository = replyRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public ReplyResponseDTO addReply(Long feedbackId, ReplyRequestDTO dto) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.ORGANIZER) {
            throw new UnauthorizedActionException("Only Admin or Organizer may reply");
        }

        FeedbackReply reply = new FeedbackReply();
        reply.setFeedback(feedback);
        reply.setRepliedBy(user);
        reply.setMessage(dto.getMessage());

        if (feedback.getStatus() == FeedbackStatus.OPEN) {
            feedback.setStatus(FeedbackStatus.IN_PROGRESS);
            feedbackRepository.save(feedback);
        }

        return toDTO(replyRepository.save(reply));
    }

    public List<ReplyResponseDTO> getReplies(Long feedbackId) {
        return replyRepository.findByFeedbackIdOrderByRepliedAtAsc(feedbackId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ReplyResponseDTO toDTO(FeedbackReply r) {
        ReplyResponseDTO dto = new ReplyResponseDTO();
        dto.setId(r.getId());
        dto.setRepliedById(r.getRepliedBy().getId());
        dto.setRepliedByName(r.getRepliedBy().getUsername());
        dto.setMessage(r.getMessage());
        dto.setRepliedAt(r.getRepliedAt());
        return dto;
    }
}