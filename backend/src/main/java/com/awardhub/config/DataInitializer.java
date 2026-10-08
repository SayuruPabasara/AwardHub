package com.awardhub.config;

import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryCriterion;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.Role;
import com.awardhub.user.entity.AccountStatus;
import com.awardhub.evaluation.model.*;
import com.awardhub.evaluation.repository.EvaluationSchemeRepository;
import com.awardhub.evaluation.repository.RubricRepository;
import com.awardhub.profile.repository.NomineeProfileRepository;
import com.awardhub.user.entity.Nominee;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final NomineeProfileRepository nomineeProfileRepository;
    private final CategoryRepository categoryRepository;
    private final EvaluationSchemeRepository schemeRepository;
    private final RubricRepository rubricRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           NomineeProfileRepository nomineeProfileRepository,
                           CategoryRepository categoryRepository,
                           EvaluationSchemeRepository schemeRepository,
                           RubricRepository rubricRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.nomineeProfileRepository = nomineeProfileRepository;
        this.categoryRepository = categoryRepository;
        this.schemeRepository = schemeRepository;
        this.rubricRepository = rubricRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCategoriesAndEvaluationMetadata();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding initial AwardHub users...");

            String encodedPassword = passwordEncoder.encode("password123");

            // 1. Admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@awardhub.com");
            admin.setFullName("System Administrator");
            admin.setPassword(encodedPassword);
            admin.setRole(Role.ADMIN);
            admin.setAccountStatus(AccountStatus.ACTIVE);
            admin.setActive(true);
            admin.setNic("NIC-ADM-001");
            admin.setBio("AwardHub System Administrator");
            userRepository.save(admin);

            // 2. Organizer
            User organizer = new User();
            organizer.setUsername("organizer");
            organizer.setEmail("organizer@awardhub.com");
            organizer.setFullName("Chief Award Organizer");
            organizer.setPassword(encodedPassword);
            organizer.setRole(Role.ORGANIZER);
            organizer.setAccountStatus(AccountStatus.ACTIVE);
            organizer.setActive(true);
            organizer.setNic("NIC-ORG-001");
            organizer.setBio("Chief Award Event Coordinator");
            userRepository.save(organizer);

            // 3. Nominee (saved via NomineeProfileRepository as Nominee subclass)
            Nominee nominee = new Nominee();
            nominee.setUsername("nominee");
            nominee.setEmail("nominee@awardhub.com");
            nominee.setFullName("Alex Rivera");
            nominee.setPassword(encodedPassword);
            nominee.setRole(Role.NOMINEE);
            nominee.setAccountStatus(AccountStatus.ACTIVE);
            nominee.setActive(true);
            nominee.setNic("NIC-NOM-001");
            nominee.setNicPassport("P-98765432");
            nominee.setBio("Innovative Tech Entrepreneur and Open Source Contributor");
            nominee.setOrganization("NextGen Solutions");
            nominee.setJobTitle("Lead Architect");
            nominee.setCity("Colombo");
            nominee.setBiography("Alex has spearheaded multiple high-impact community engineering projects.");
            nomineeProfileRepository.save(nominee);

            // 4. Judge
            User judge = new User();
            judge.setUsername("judge");
            judge.setEmail("judge@awardhub.com");
            judge.setFullName("Dr. Eleanor Vance");
            judge.setPassword(encodedPassword);
            judge.setRole(Role.JUDGE);
            judge.setAccountStatus(AccountStatus.ACTIVE);
            judge.setActive(true);
            judge.setNic("NIC-JDG-001");
            judge.setBio("Distinguished Senior Evaluator & Faculty Chair");
            userRepository.save(judge);

            // 5. Voter
            User voter = new User();
            voter.setUsername("voter");
            voter.setEmail("voter@awardhub.com");
            voter.setFullName("Jordan Smith");
            voter.setPassword(encodedPassword);
            voter.setRole(Role.VOTER);
            voter.setAccountStatus(AccountStatus.ACTIVE);
            voter.setActive(true);
            voter.setNic("NIC-VTR-001");
            voter.setBio("Active Community Member and Verified Voter");
            userRepository.save(voter);

            // 6. IT Coordinator
            User itCoord = new User();
            itCoord.setUsername("itcoordinator");
            itCoord.setEmail("itcoordinator@awardhub.com");
            itCoord.setFullName("Marcus Wright");
            itCoord.setPassword(encodedPassword);
            itCoord.setRole(Role.IT_COORDINATOR);
            itCoord.setAccountStatus(AccountStatus.ACTIVE);
            itCoord.setActive(true);
            itCoord.setNic("NIC-ITC-001");
            itCoord.setBio("Platform Infrastructure & Security Coordinator");
            userRepository.save(itCoord);

            log.info("Successfully seeded 6 AwardHub users (password: password123).");
        }
    }

    private void seedCategoriesAndEvaluationMetadata() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding initial AwardHub categories and evaluation schemes...");

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime nomStart = now.minusDays(10);
            LocalDateTime nomEnd = now.plusDays(20);
            LocalDateTime voteStart = now.minusDays(5);
            LocalDateTime voteEnd = now.plusDays(25);
            LocalDateTime resultPub = now.plusDays(30);

            // Category 1
            Category cat1 = new Category();
            cat1.setAwardEventId(1L);
            cat1.setName("Best Innovative Software Solution");
            cat1.setDescription("Recognizing software systems demonstrating outstanding architectural excellence, resilience, and user impact.");
            cat1.setRules("Submissions must include architecture documentation and demonstration video.");
            cat1.setNomineeEligibility("Open to all registered software engineering teams and individual creators.");
            cat1.setVoterEligibility("Verified platform accounts with confirmed identity.");
            cat1.setNominationRequirements("Working prototype link, architectural design, and reference contacts.");
            cat1.setNominationStartDate(nomStart);
            cat1.setNominationEndDate(nomEnd);
            cat1.setVotingStartDate(voteStart);
            cat1.setVotingEndDate(voteEnd);
            cat1.setResultPublicationDate(resultPub);
            cat1.setStatus(CategoryStatus.VOTING_OPEN);
            cat1.setCreatedBy("Chief Award Organizer");

            CategoryCriterion c1 = new CategoryCriterion();
            c1.setCriterionName("Technical Innovation & Complexity");
            c1.setDescription("Depth of technical innovation and problem complexity addressed.");
            c1.setWeight(new BigDecimal("50.00"));
            c1.setMaxScore(10);
            cat1.addCriterion(c1);

            CategoryCriterion c2 = new CategoryCriterion();
            c2.setCriterionName("Usability & Public Impact");
            c2.setDescription("End-user adoption, interface quality, and community value.");
            c2.setWeight(new BigDecimal("50.00"));
            c2.setMaxScore(10);
            cat1.addCriterion(c2);

            Category savedCat1 = categoryRepository.save(cat1);

            // Category 2
            Category cat2 = new Category();
            cat2.setAwardEventId(1L);
            cat2.setName("Outstanding AI & Data Science Research");
            cat2.setDescription("Honoring groundbreaking artificial intelligence methodologies, reproducible datasets, and ethical applications.");
            cat2.setRules("Published manuscripts or reproducible code repositories required.");
            cat2.setNomineeEligibility("Postgraduate researchers, academic faculty, and industry scientists.");
            cat2.setVoterEligibility("Academic peers and verified platform voters.");
            cat2.setNominationRequirements("Research paper preprint or published DOI, replication repository.");
            cat2.setNominationStartDate(nomStart);
            cat2.setNominationEndDate(nomEnd);
            cat2.setVotingStartDate(voteStart);
            cat2.setVotingEndDate(voteEnd);
            cat2.setResultPublicationDate(resultPub);
            cat2.setStatus(CategoryStatus.ACTIVE);
            cat2.setCreatedBy("Chief Award Organizer");

            CategoryCriterion c3 = new CategoryCriterion();
            c3.setCriterionName("Methodological Rigor");
            c3.setDescription("Soundness of mathematical proofs and empirical validation.");
            c3.setWeight(new BigDecimal("60.00"));
            c3.setMaxScore(10);
            cat2.addCriterion(c3);

            CategoryCriterion c4 = new CategoryCriterion();
            c4.setCriterionName("Practical Utility & Ethics");
            c4.setDescription("Potential for real-world application adhering to responsible AI standards.");
            c4.setWeight(new BigDecimal("40.00"));
            c4.setMaxScore(10);
            cat2.addCriterion(c4);

            Category savedCat2 = categoryRepository.save(cat2);

            // Evaluation Scheme for Category 1
            if (schemeRepository.findByCategoryId(savedCat1.getId()).isEmpty()) {
                EvaluationScheme scheme1 = new EvaluationScheme();
                scheme1.setCategoryId(savedCat1.getId());
                scheme1.setCategoryName(savedCat1.getName());
                scheme1.setMode(EvaluationMode.HYBRID);
                scheme1.setJudgeWeight(new BigDecimal("0.6000"));
                scheme1.setPublicWeight(new BigDecimal("0.4000"));
                scheme1.setAggregationMethod(AggregationMethod.MEAN);
                scheme1.setVoteNormalization(VoteNormalization.MAX_IN_CATEGORY);
                scheme1.setMinJudgesRequired(1);
                scheme1.setBlindReview(false);
                scheme1.setLocked(false);
                schemeRepository.save(scheme1);
            }

            // Rubric for Category 1
            if (rubricRepository.findByCategoryIdAndActiveTrue(savedCat1.getId()).isEmpty()) {
                Rubric rubric1 = new Rubric();
                rubric1.setCategoryId(savedCat1.getId());
                rubric1.setName(savedCat1.getName() + " Rubric");
                rubric1.setVersion(1);
                rubric1.setScaleMin(1);
                rubric1.setScaleMax(10);
                rubric1.setActive(true);

                RubricCriterion rc1 = new RubricCriterion();
                rc1.setName("Technical Innovation & Complexity");
                rc1.setDescription("Depth of technical innovation and problem complexity addressed.");
                rc1.setWeight(new BigDecimal("0.5000"));
                rc1.setDisplayOrder(1);
                rubric1.addCriterion(rc1);

                RubricCriterion rc2 = new RubricCriterion();
                rc2.setName("Usability & Public Impact");
                rc2.setDescription("End-user adoption, interface quality, and community value.");
                rc2.setWeight(new BigDecimal("0.5000"));
                rc2.setDisplayOrder(2);
                rubric1.addCriterion(rc2);

                rubricRepository.save(rubric1);
            }

            log.info("Successfully seeded categories, criteria, evaluation schemes, and rubrics.");
        }
    }
}
