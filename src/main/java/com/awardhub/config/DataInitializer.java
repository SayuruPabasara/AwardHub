package com.awardhub.config;

import com.awardhub.common.enums.Role;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = createUser("admin", "admin.awards@sliit.lk", "Dr. Sanath Jayawardena", Role.ADMIN);
            User organizer = createUser("organizer", "kalinga.s@sliit.lk", "Prof. Kalinga Silva", Role.ORGANIZER);
            User nominee = createUser("kavindu", "it25101477@my.sliit.lk", "Kavindu Perera", Role.NOMINEE);
            User judge1 = createUser("judge1", "anoma.w@industrylabs.io", "Dr. Anoma Wijesinghe", Role.JUDGE);
            User judge2 = createUser("judge2", "roshan.w@innovatesrilanka.org", "Mr. Roshan Wickramaratne", Role.JUDGE);
            User voter = createUser("voter1", "dinuka.f@gmail.com", "Dinuka Fernando", Role.VOTER);

            userRepository.saveAll(List.of(admin, organizer, nominee, judge1, judge2, voter));
            System.out.println("AwardHub: Seeded initial users for all roles successfully.");
        }
    }

    private User createUser(String username, String email, String fullName, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setPassword("pass123");
        user.setActive(true);
        return user;
    }
}
