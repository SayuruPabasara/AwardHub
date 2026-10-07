package com.awardhub.controller;

import com.awardhub.dto.DTOs.NominationDto;
import com.awardhub.dto.DTOs.StatsDto;
import com.awardhub.dto.DTOs.VotingCreateRequest;
import com.awardhub.dto.DTOs.VotingDto;
import com.awardhub.dto.DTOs.WinnerDto;
import com.awardhub.entity.User;
import com.awardhub.security.CurrentUser;
import com.awardhub.service.VotingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VotingController {

    private final VotingService votings;

    public VotingController(VotingService votings) {
        this.votings = votings;
    }

    private static String ip(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    @GetMapping("/votings")
    public List<VotingDto> all() {
        return votings.listAll();
    }

    @GetMapping("/votings/{id}")
    public VotingDto one(@PathVariable Long id) {
        return votings.get(id);
    }

    /** STRATEGY demo: /api/votings/{id}/winner?mode=popular|judge */
    @GetMapping("/votings/{id}/winner")
    public NominationDto winner(@PathVariable Long id, @RequestParam(defaultValue = "popular") String mode) {
        var n = votings.resolveWinner(id, mode);
        return n != null ? NominationDto.from(n) : null;
    }

    @GetMapping("/stats")
    public StatsDto stats() {
        return votings.stats();
    }

    @GetMapping("/winners")
    public List<WinnerDto> winners() {
        return votings.winners();
    }

    @PostMapping("/votings")
    public VotingDto create(@RequestBody VotingCreateRequest body, HttpServletRequest http) {
        return votings.create(body, CurrentUser.get(), ip(http));
    }

    @PutMapping("/votings/{id}")
    public VotingDto update(@PathVariable Long id, @RequestBody VotingCreateRequest body, HttpServletRequest http) {
        return votings.update(id, body, CurrentUser.get(), ip(http));
    }

    @DeleteMapping("/votings/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest http) {
        votings.delete(id, CurrentUser.get(), ip(http));
        return ResponseEntity.noContent().build();
    }
}
