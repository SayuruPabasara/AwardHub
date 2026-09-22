package com.awardhub.controller;

import com.awardhub.dto.DTOs.MessageResponse;
import com.awardhub.dto.DTOs.VoteDto;
import com.awardhub.dto.DTOs.VoteRequest;
import com.awardhub.security.CurrentUser;
import com.awardhub.service.VoteService;
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

    @PostMapping("/api/votings/{id}/votes")
    public VoteDto cast(@PathVariable Long id, @RequestBody VoteRequest body, HttpServletRequest http) {
        return votes.cast(id, body, CurrentUser.get(), ip(http));
    }

    @DeleteMapping("/api/votings/{id}/votes")
    public MessageResponse withdraw(@PathVariable Long id, HttpServletRequest http) {
        votes.withdraw(id, CurrentUser.get(), ip(http));
        return new MessageResponse("Vote withdrawn.");
    }

    @GetMapping("/api/my/votes")
    public List<VoteDto> mine() {
        return votes.mine(CurrentUser.get());
    }
}
