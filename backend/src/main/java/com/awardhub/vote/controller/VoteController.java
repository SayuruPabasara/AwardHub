package com.awardhub.vote.controller;

import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.user.entity.User;
import com.awardhub.vote.dto.VoteDTOs.MessageResponse;
import com.awardhub.vote.dto.VoteDTOs.VoteDto;
import com.awardhub.vote.dto.VoteDTOs.VoteRequest;
import com.awardhub.vote.security.CurrentUser;
import com.awardhub.vote.service.VoteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class VoteController {

    private final VoteService votes;

    public VoteController(VoteService votes) {
        this.votes = votes;
    }

    private static String ip(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    private User currentUser() {
        User u = CurrentUser.get();
        if (u == null) {
            throw new UnauthorizedActionException("Not authenticated");
        }
        return u;
    }

    @PostMapping({"/api/categories/{id}/votes", "/api/votings/{id}/votes"})
    public VoteDto cast(@PathVariable Long id, @RequestBody VoteRequest body, HttpServletRequest http) {
        return votes.cast(id, body, currentUser(), ip(http));
    }

    @PutMapping({"/api/categories/{id}/votes", "/api/votings/{id}/votes"})
    public VoteDto update(@PathVariable Long id, @RequestBody VoteRequest body, HttpServletRequest http) {
        return votes.update(id, body, currentUser(), ip(http));
    }

    @DeleteMapping({"/api/categories/{id}/votes", "/api/votings/{id}/votes"})
    public MessageResponse withdraw(@PathVariable Long id, HttpServletRequest http) {
        votes.withdraw(id, currentUser(), ip(http));
        return new MessageResponse("Vote withdrawn successfully.");
    }

    @GetMapping("/api/my/votes")
    public List<VoteDto> mine() {
        return votes.mine(currentUser());
    }
}
