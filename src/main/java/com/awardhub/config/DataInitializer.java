package com.awardhub.config;

import com.awardhub.category.dto.CategoryCriterionRequest;
import com.awardhub.category.dto.CategoryRequest;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.category.service.CategoryService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.Role;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            CategoryRepository categoryRepository,
            CategoryService categoryService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed demo users for all supported roles
        seedUserIfNotExists("organizer@awardhub.com", "Organizer@123", "Award Organizer", Role.AWARD_ORGANIZER);
        seedUserIfNotExists("judge@awardhub.com", "Judge@123", "Dr. Eleanor Vance", Role.JUDGE);
        seedUserIfNotExists("judge2@awardhub.com", "Judge@123", "Prof. Marcus Chen", Role.JUDGE);
        seedUserIfNotExists("judge3@awardhub.com", "Judge@123", "Sarah Jenkins", Role.JUDGE);
        seedUserIfNotExists("nominee@awardhub.com", "Nominee@123", "Alex Rivera", Role.NOMINEE);
        seedUserIfNotExists("voter@awardhub.com", "Voter@123", "Jordan Smith", Role.VOTER);
        seedUserIfNotExists("admin@awardhub.com", "Admin@123", "System Administrator", Role.ADMINISTRATOR);

        // Seed initial judge assignment for demo judge if categories exist and assignment doesn't
        userRepository.findByEmail("judge@awardhub.com").ifPresent(judge -> {
            categoryRepository.findAll().stream().findFirst().ifPresent(firstCat -> {
                try {
                    categoryService.assignJudge(firstCat.getId(), judge.getId(), "System Initializer");
                    log.info("Assigned demo judge '{}' to category '{}'", judge.getFullName(), firstCat.getName());
                } catch (Exception ignored) {
                    // Already assigned or invalid
                }
            });
        });

        if (categoryRepository.count() > 0) {
            log.info("Categories already seeded. Total categories: {}", categoryRepository.count());
            return;
        }

        log.info("Seeding initial Award Category data for demo / evaluation...");

        try {
            // Category 1: Best Young Entrepreneur
            CategoryRequest cat1 = new CategoryRequest();
            cat1.setAwardEventId(1L);
            cat1.setName("Best Young Entrepreneur");
            cat1.setDescription("Honoring visionary founders under age 35 who have demonstrated extraordinary business growth, resilience, and ethical leadership.");
            cat1.setRules("Nominees must submit verified revenue reports. Self-nominations permitted.");
            cat1.setNomineeEligibility("Under 35 years old on Jan 1 2026. Founder or Co-founder of a registered enterprise operating for at least 2 years.");
            cat1.setVoterEligibility("Registered platform voters with authenticated profile. One vote per verified citizen.");
            cat1.setNominationRequirements("Pitch deck, audited financial summary, business registration document, and 2 professional references.");
            cat1.setNominationStartDate(LocalDateTime.of(2026, 3, 1, 0, 0));
            cat1.setNominationEndDate(LocalDateTime.of(2026, 4, 15, 23, 59));
            cat1.setVotingStartDate(LocalDateTime.of(2026, 4, 20, 0, 0));
            cat1.setVotingEndDate(LocalDateTime.of(2026, 5, 10, 23, 59));
            cat1.setResultPublicationDate(LocalDateTime.of(2026, 5, 25, 18, 0));
            cat1.setStatus(CategoryStatus.ACTIVE);
            cat1.setCreatedBy("Award Organizer");
            cat1.setCriteria(Arrays.asList(
                    new CategoryCriterionRequest("Business Innovation & Disruption", "Novelty of product/service and business model sustainability.", new BigDecimal("30.00"), 10),
                    new CategoryCriterionRequest("Financial Performance & Growth", "Verified revenue growth and profitability trajectory.", new BigDecimal("25.00"), 10),
                    new CategoryCriterionRequest("Social & Environmental Impact", "Commitment to sustainability and job creation.", new BigDecimal("25.00"), 10),
                    new CategoryCriterionRequest("Leadership & Resilience", "Demonstrated strategic problem solving and team culture.", new BigDecimal("20.00"), 10)
            ));
            categoryService.createCategory(cat1);

            // Category 2: Outstanding IT Professional
            CategoryRequest cat2 = new CategoryRequest();
            cat2.setAwardEventId(1L);
            cat2.setName("Outstanding IT Professional");
            cat2.setDescription("Recognizing software engineers, architects, and cybersecurity specialists driving breakthrough technology adoption.");
            cat2.setRules("Contributions must have occurred within the past 24 months. Peer or manager nomination required.");
            cat2.setNomineeEligibility("Minimum 5 years active industry experience in software engineering, cloud architecture, or cybersecurity.");
            cat2.setVoterEligibility("All registered AwardHub users.");
            cat2.setNominationRequirements("Updated CV, portfolio links (e.g. GitHub/patents), recommendation letter from employer.");
            cat2.setNominationStartDate(LocalDateTime.of(2026, 1, 10, 0, 0));
            cat2.setNominationEndDate(LocalDateTime.of(2026, 2, 15, 23, 59));
            cat2.setVotingStartDate(LocalDateTime.of(2026, 2, 20, 0, 0));
            cat2.setVotingEndDate(LocalDateTime.of(2026, 4, 1, 23, 59));
            cat2.setResultPublicationDate(LocalDateTime.of(2026, 4, 15, 19, 0));
            cat2.setStatus(CategoryStatus.VOTING_OPEN);
            cat2.setCreatedBy("Award Organizer");
            cat2.setCriteria(Arrays.asList(
                    new CategoryCriterionRequest("Technical Architecture & Complexity", "Depth of engineering difficulty and architectural elegance.", new BigDecimal("35.00"), 10),
                    new CategoryCriterionRequest("Open Source & Community Contribution", "Contributions to developer community, mentorship, or tech talks.", new BigDecimal("25.00"), 10),
                    new CategoryCriterionRequest("Industry Adoption & Business Value", "Measurable uptime, scalability, or cost reduction achieved.", new BigDecimal("25.00"), 10),
                    new CategoryCriterionRequest("Professional Ethics & Code Quality", "Commitment to best engineering practices, testing, and security standards.", new BigDecimal("15.00"), 10)
            ));
            categoryService.createCategory(cat2);

            // Category 3: Best Community Service
            CategoryRequest cat3 = new CategoryRequest();
            cat3.setAwardEventId(1L);
            cat3.setName("Best Community Service");
            cat3.setDescription("Celebrating grassroots champions who have led humanitarian, educational, or environmental service projects.");
            cat3.setRules("Non-commercial volunteer projects only. Evidence of community testimonials required.");
            cat3.setNomineeEligibility("Individuals or non-profit volunteer groups active for over 1 year.");
            cat3.setVoterEligibility("Verified public voter registry.");
            cat3.setNominationRequirements("Project report, beneficiary impact numbers, photographic proof, community endorsement letters.");
            cat3.setNominationStartDate(LocalDateTime.of(2026, 4, 1, 0, 0));
            cat3.setNominationEndDate(LocalDateTime.of(2026, 5, 15, 23, 59));
            cat3.setVotingStartDate(LocalDateTime.of(2026, 5, 20, 0, 0));
            cat3.setVotingEndDate(LocalDateTime.of(2026, 6, 15, 23, 59));
            cat3.setResultPublicationDate(LocalDateTime.of(2026, 6, 30, 18, 0));
            cat3.setStatus(CategoryStatus.DRAFT);
            cat3.setCreatedBy("Award Organizer");
            cat3.setCriteria(Arrays.asList(
                    new CategoryCriterionRequest("Breadth of Community Impact", "Number of lives positively impacted and tangible problem solved.", new BigDecimal("40.00"), 10),
                    new CategoryCriterionRequest("Project Sustainability", "Long-term viability and volunteer mobilization.", new BigDecimal("30.00"), 10),
                    new CategoryCriterionRequest("Resource Efficiency & Transparency", "Responsible handling of donated resources and operational transparency.", new BigDecimal("30.00"), 10)
            ));
            categoryService.createCategory(cat3);

            // Category 4: Best Creative Artist
            CategoryRequest cat4 = new CategoryRequest();
            cat4.setAwardEventId(1L);
            cat4.setName("Best Creative Artist");
            cat4.setDescription("Spotlighting exceptional achievements in digital arts, visual storytelling, music, and multimedia design.");
            cat4.setRules("All submitted works must be original and free of copyright infringements.");
            cat4.setNomineeEligibility("Practicing artists, animators, designers, or creators residing nationally.");
            cat4.setVoterEligibility("Registered public voters and accredited arts guild members.");
            cat4.setNominationRequirements("Portfolio of minimum 3 flagship pieces produced in 2025/2026 with high-res media links.");
            cat4.setNominationStartDate(LocalDateTime.of(2025, 11, 1, 0, 0));
            cat4.setNominationEndDate(LocalDateTime.of(2025, 12, 15, 23, 59));
            cat4.setVotingStartDate(LocalDateTime.of(2026, 1, 1, 0, 0));
            cat4.setVotingEndDate(LocalDateTime.of(2026, 2, 15, 23, 59));
            cat4.setResultPublicationDate(LocalDateTime.of(2026, 3, 1, 19, 0));
            cat4.setStatus(CategoryStatus.VOTING_CLOSED);
            cat4.setCreatedBy("Award Organizer");
            cat4.setCriteria(Arrays.asList(
                    new CategoryCriterionRequest("Originality & Artistic Vision", "Uniqueness of concept, emotional resonance, and distinctive style.", new BigDecimal("35.00"), 10),
                    new CategoryCriterionRequest("Technical Execution & Craftsmanship", "Mastery of tools, composition, audio/visual fidelity.", new BigDecimal("35.00"), 10),
                    new CategoryCriterionRequest("Cultural & Contemporary Relevance", "Message clarity and resonance with societal themes.", new BigDecimal("30.00"), 10)
            ));
            categoryService.createCategory(cat4);

            // Category 5: Best Sports Achievement (ARCHIVED)
            CategoryRequest cat5 = new CategoryRequest();
            cat5.setAwardEventId(1L);
            cat5.setName("Best Sports Achievement");
            cat5.setDescription("Historical archive of athletic excellence across varsity and national level competitions.");
            cat5.setRules("Federation-certified athletic records required.");
            cat5.setNomineeEligibility("Competed in national or inter-collegiate championships.");
            cat5.setVoterEligibility("General public voting and sports advisory board.");
            cat5.setNominationRequirements("Official tournament scorecards and coach endorsement.");
            cat5.setNominationStartDate(LocalDateTime.of(2024, 8, 1, 0, 0));
            cat5.setNominationEndDate(LocalDateTime.of(2024, 9, 15, 23, 59));
            cat5.setVotingStartDate(LocalDateTime.of(2024, 9, 20, 0, 0));
            cat5.setVotingEndDate(LocalDateTime.of(2024, 10, 15, 23, 59));
            cat5.setResultPublicationDate(LocalDateTime.of(2024, 10, 30, 18, 0));
            cat5.setStatus(CategoryStatus.ARCHIVED);
            cat5.setCreatedBy("Award Organizer");
            cat5.setCriteria(Arrays.asList(
                    new CategoryCriterionRequest("Competitive Distinction & Medals", "Level of tournament and podium finishes secured.", new BigDecimal("50.00"), 10),
                    new CategoryCriterionRequest("Sportsmanship & Fair Play", "Integrity and discipline on and off the field.", new BigDecimal("25.00"), 10),
                    new CategoryCriterionRequest("Team Leadership & Mentorship", "Inspiration to teammates and youth athletics.", new BigDecimal("25.00"), 10)
            ));
            var cat5Resp = categoryService.createCategory(cat5);
            categoryService.archiveCategory(cat5Resp.getId());

            log.info("Demo categories successfully seeded!");
        } catch (Exception e) {
            log.error("Error seeding initial categories: {}", e.getMessage(), e);
        }
    }

    private void seedUserIfNotExists(String email, String rawPassword, String fullName, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(
                    null,
                    email,
                    passwordEncoder.encode(rawPassword),
                    fullName,
                    role
            );
            userRepository.save(user);
            log.info("Demo user created: {} ({}) with role: {}", email, fullName, role);
        }
    }
}
