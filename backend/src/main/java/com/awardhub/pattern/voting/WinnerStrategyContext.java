package com.awardhub.pattern.voting;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.entity.Nomination;
import com.awardhub.entity.Voting;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * STRATEGY CONTEXT + FACTORY: picks the algorithm at runtime by key.
 * Doubles as the Factory for strategies ({@code popular} / {@code judge}).
 * Spring {@code @Component} beans are singletons by default (Singleton pattern via container).
 */
@Component
public class WinnerStrategyContext {

    private final Map<String, WinnerStrategy> strategies;

    public WinnerStrategyContext(List<WinnerStrategy> all) {
        this.strategies = all.stream()
                .collect(Collectors.toMap(WinnerStrategy::key, Function.identity()));
    }

    public WinnerStrategy strategy(String mode) {
        String key = (mode == null || mode.isBlank()) ? "popular" : mode.toLowerCase();
        WinnerStrategy s = strategies.get(key);
        if (s == null) throw new BadRequestException("Unknown winner mode: " + mode + " (use popular|judge).");
        return s;
    }

    public Optional<Nomination> resolveWinner(Voting voting, List<Nomination> approved, String mode) {
        return strategy(mode).pickWinner(voting, approved);
    }
}
