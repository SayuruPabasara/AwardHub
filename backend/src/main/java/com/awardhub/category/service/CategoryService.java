package com.awardhub.category.service;

import com.awardhub.category.dto.*;
import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryCriterion;
import com.awardhub.category.entity.CategoryJudge;
import com.awardhub.category.repository.CategoryCriterionRepository;
import com.awardhub.category.repository.CategoryJudgeRepository;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.DuplicateResourceException;
import com.awardhub.common.exception.InvalidStatusTransitionException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.AssignmentStatus;
import com.awardhub.evaluation.model.EvaluationStatus;
import com.awardhub.evaluation.model.JudgeAssignment;
import com.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.evaluation.repository.JudgeAssignmentRepository;
import com.awardhub.evaluation.repository.ResultSetRepository;
import com.awardhub.nomination.repository.NominationRepository;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import com.awardhub.vote.repository.VoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;
    private final CategoryCriterionRepository criterionRepository;
    private final CategoryJudgeRepository categoryJudgeRepository;
    private final UserRepository userRepository;
    private final NominationRepository nominationRepository;
    private final VoteRepository voteRepository;
    private final EvaluationRepository evaluationRepository;
    private final ResultSetRepository resultSetRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;

    // In-memory award event dictionary for integration readiness
    private static final Map<Long, String> KNOWN_EVENTS = new LinkedHashMap<>();

    static {
        KNOWN_EVENTS.put(1L, "Grand Excellence Awards 2026");
        KNOWN_EVENTS.put(2L, "National Tech Innovation Awards 2026");
        KNOWN_EVENTS.put(3L, "SLIIT Annual Sports & Community Awards 2026");
    }

    @org.springframework.beans.factory.annotation.Autowired
    public CategoryService(
            CategoryRepository categoryRepository,
            CategoryCriterionRepository criterionRepository,
            CategoryJudgeRepository categoryJudgeRepository,
            UserRepository userRepository,
            NominationRepository nominationRepository,
            VoteRepository voteRepository,
            EvaluationRepository evaluationRepository,
            ResultSetRepository resultSetRepository,
            JudgeAssignmentRepository judgeAssignmentRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.criterionRepository = criterionRepository;
        this.categoryJudgeRepository = categoryJudgeRepository;
        this.userRepository = userRepository;
        this.nominationRepository = nominationRepository;
        this.voteRepository = voteRepository;
        this.evaluationRepository = evaluationRepository;
        this.resultSetRepository = resultSetRepository;
        this.judgeAssignmentRepository = judgeAssignmentRepository;
    }

    private String getAwardEventName(Long eventId) {
        return KNOWN_EVENTS.getOrDefault(eventId, "Award Event #" + eventId);
    }

    // =========================================================================
    // 1. ORGANIZER FULL CRUD OPERATIONS
    // =========================================================================

    /**
     * Create a new category with criteria rubric
     */
    @Transactional
    public CategoryDetailsResponse createCategory(CategoryRequest request) {
        if (request.getAwardEventId() == null) {
            request.setAwardEventId(1L);
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            request.setDescription(request.getName() != null ? request.getName().trim() : "Category");
        }
        LocalDateTime now = LocalDateTime.now();
        if (request.getVotingEndDate() == null) {
            request.setVotingEndDate(now.plusDays(14));
        }
        if (request.getVotingStartDate() == null) {
            request.setVotingStartDate(now);
        }
        if (request.getNominationEndDate() == null) {
            request.setNominationEndDate(request.getVotingStartDate());
        }
        if (request.getNominationStartDate() == null) {
            request.setNominationStartDate(request.getNominationEndDate().minusDays(14));
        }
        if (request.getResultPublicationDate() == null) {
            request.setResultPublicationDate(request.getVotingEndDate().plusDays(2));
        }
        if (request.getCriteria() == null || request.getCriteria().isEmpty()) {
            CategoryCriterionRequest defaultCriterion = new CategoryCriterionRequest();
            defaultCriterion.setCriterionName("Overall Merit & Excellence");
            defaultCriterion.setDescription("General evaluation criteria for this category.");
            defaultCriterion.setWeight(new BigDecimal("100.00"));
            defaultCriterion.setMaxScore(100);
            request.setCriteria(List.of(defaultCriterion));
        }

        log.info("Creating new award category: '{}' for award event id: {}", request.getName(), request.getAwardEventId());

        if (categoryRepository.existsByAwardEventIdAndName(request.getAwardEventId(), request.getName().trim())) {
            throw new DuplicateResourceException("Category name '" + request.getName().trim() + "' already exists for this award event.");
        }

        validateScheduleDates(
                request.getNominationStartDate(),
                request.getNominationEndDate(),
                request.getVotingStartDate(),
                request.getVotingEndDate(),
                request.getResultPublicationDate()
        );

        validateCriteria(request.getCriteria());

        Category category = new Category();
        category.setAwardEventId(request.getAwardEventId());
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());
        category.setRules(request.getRules());
        category.setNomineeEligibility(request.getNomineeEligibility());
        category.setVoterEligibility(request.getVoterEligibility());
        category.setNominationRequirements(request.getNominationRequirements());
        category.setNominationStartDate(request.getNominationStartDate());
        category.setNominationEndDate(request.getNominationEndDate());
        category.setVotingStartDate(request.getVotingStartDate());
        category.setVotingEndDate(request.getVotingEndDate());
        category.setResultPublicationDate(request.getResultPublicationDate());
        category.setStatus(request.getStatus() != null ? request.getStatus() : CategoryStatus.DRAFT);
        category.setCreatedBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Award Organizer");

        if (request.getCriteria() != null) {
            for (CategoryCriterionRequest crReq : request.getCriteria()) {
                CategoryCriterion criterion = new CategoryCriterion();
                criterion.setCriterionName(crReq.getCriterionName().trim());
                criterion.setDescription(crReq.getDescription());
                criterion.setWeight(crReq.getWeight().setScale(2, RoundingMode.HALF_UP));
                criterion.setMaxScore(crReq.getMaxScore());
                category.addCriterion(criterion);
            }
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Successfully created category id: {}", savedCategory.getId());
        return mapToDetailsResponse(savedCategory);
    }

    /**
     * Get paginated and filtered categories for Organizer
     */
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(
            Long eventId,
            CategoryStatus status,
            boolean includeArchived,
            String search,
            Pageable pageable
    ) {
        Page<Category> categoryPage = categoryRepository.findCategories(
                eventId,
                status,
                includeArchived,
                search != null ? search.trim() : "",
                pageable
        );
        return categoryPage.map(this::mapToSummaryResponse);
    }

    /**
     * Get single category details by ID
     */
    @Transactional(readOnly = true)
    public CategoryDetailsResponse getCategoryById(Long id) {
        Category category = categoryRepository.findByIdWithCriteria(id)
                .or(() -> categoryRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDetailsResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryDetailsResponse getCategoryDetails(Long id) {
        return getCategoryById(id);
    }

    /**
     * Update category configuration and rubric
     */
    @Transactional
    public CategoryDetailsResponse updateCategory(Long id, CategoryUpdateRequest request) {
        log.info("Updating category id: {}", id);

        Category category = categoryRepository.findByIdWithCriteria(id)
                .or(() -> categoryRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.getStatus() == CategoryStatus.ARCHIVED) {
            throw new BadRequestException("Archived category cannot be modified.");
        }

        if (request.getAwardEventId() == null) {
            request.setAwardEventId(category.getAwardEventId() != null ? category.getAwardEventId() : 1L);
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            request.setDescription(category.getDescription() != null ? category.getDescription() : request.getName().trim());
        }
        if (request.getVotingEndDate() == null) {
            request.setVotingEndDate(category.getVotingEndDate() != null ? category.getVotingEndDate() : LocalDateTime.now().plusDays(14));
        }
        if (request.getVotingStartDate() == null) {
            request.setVotingStartDate(category.getVotingStartDate() != null ? category.getVotingStartDate() : LocalDateTime.now());
        }
        if (request.getNominationEndDate() == null) {
            request.setNominationEndDate(category.getNominationEndDate() != null ? category.getNominationEndDate() : request.getVotingStartDate());
        }
        if (request.getNominationStartDate() == null) {
            request.setNominationStartDate(category.getNominationStartDate() != null ? category.getNominationStartDate() : request.getNominationEndDate().minusDays(14));
        }
        if (request.getResultPublicationDate() == null) {
            request.setResultPublicationDate(category.getResultPublicationDate() != null ? category.getResultPublicationDate() : request.getVotingEndDate().plusDays(2));
        }
        if (request.getCriteria() == null || request.getCriteria().isEmpty()) {
            if (category.getCriteria() != null && !category.getCriteria().isEmpty()) {
                request.setCriteria(category.getCriteria().stream().map(c -> {
                    CategoryCriterionRequest cr = new CategoryCriterionRequest();
                    cr.setCriterionName(c.getCriterionName());
                    cr.setDescription(c.getDescription());
                    cr.setWeight(c.getWeight());
                    cr.setMaxScore(c.getMaxScore());
                    return cr;
                }).collect(Collectors.toList()));
            } else {
                CategoryCriterionRequest defaultCriterion = new CategoryCriterionRequest();
                defaultCriterion.setCriterionName("Overall Merit & Excellence");
                defaultCriterion.setDescription("General evaluation criteria for this category.");
                defaultCriterion.setWeight(new BigDecimal("100.00"));
                defaultCriterion.setMaxScore(100);
                request.setCriteria(List.of(defaultCriterion));
            }
        }

        if (categoryRepository.existsByAwardEventIdAndNameAndIdNot(request.getAwardEventId(), request.getName().trim(), id)) {
            throw new DuplicateResourceException("Category name '" + request.getName().trim() + "' already exists for this award event.");
        }

        validateScheduleDates(
                request.getNominationStartDate(),
                request.getNominationEndDate(),
                request.getVotingStartDate(),
                request.getVotingEndDate(),
                request.getResultPublicationDate()
        );

        if (category.getStatus() == CategoryStatus.VOTING_OPEN) {
            if (!category.getVotingStartDate().isEqual(request.getVotingStartDate()) ||
                !category.getVotingEndDate().isEqual(request.getVotingEndDate())) {
                throw new BadRequestException("Cannot modify voting window dates while voting is currently active/open.");
            }
        }

        validateCriteria(request.getCriteria());

        category.setAwardEventId(request.getAwardEventId());
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());
        category.setRules(request.getRules());
        category.setNomineeEligibility(request.getNomineeEligibility());
        category.setVoterEligibility(request.getVoterEligibility());
        category.setNominationRequirements(request.getNominationRequirements());
        category.setNominationStartDate(request.getNominationStartDate());
        category.setNominationEndDate(request.getNominationEndDate());
        category.setVotingStartDate(request.getVotingStartDate());
        category.setVotingEndDate(request.getVotingEndDate());
        category.setResultPublicationDate(request.getResultPublicationDate());

        category.clearCriteria();
        for (CategoryCriterionRequest crReq : request.getCriteria()) {
            CategoryCriterion criterion = new CategoryCriterion();
            criterion.setCriterionName(crReq.getCriterionName().trim());
            criterion.setDescription(crReq.getDescription());
            criterion.setWeight(crReq.getWeight().setScale(2, RoundingMode.HALF_UP));
            criterion.setMaxScore(crReq.getMaxScore());
            category.addCriterion(criterion);
        }

        Category updatedCategory = categoryRepository.save(category);
        log.info("Successfully updated category id: {}", updatedCategory.getId());
        return mapToDetailsResponse(updatedCategory);
    }

    /**
     * Update category lifecycle status
     */
    @Transactional
    public CategoryDetailsResponse updateStatus(Long id, CategoryStatus newStatus) {
        log.info("Updating status for category id: {} to {}", id, newStatus);

        Category category = categoryRepository.findByIdWithCriteria(id)
                .or(() -> categoryRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        CategoryStatus currentStatus = category.getStatus();

        if (currentStatus == newStatus) {
            return mapToDetailsResponse(category);
        }

        validateStatusTransition(category, currentStatus, newStatus);

        category.setStatus(newStatus);
        if (newStatus == CategoryStatus.ARCHIVED) {
            category.setArchivedAt(LocalDateTime.now());
        }

        Category updated = categoryRepository.save(category);
        log.info("Category id: {} transitioned from {} to {}", id, currentStatus, newStatus);
        return mapToDetailsResponse(updated);
    }

    /**
     * Soft archive category
     */
    @Transactional
    public CategoryDetailsResponse archiveCategory(Long id) {
        log.info("Archiving category id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.getStatus() == CategoryStatus.ARCHIVED) {
            return mapToDetailsResponse(category);
        }

        if (category.getStatus() == CategoryStatus.VOTING_OPEN) {
            throw new InvalidStatusTransitionException("Cannot archive a category while voting is currently open. Please close voting before archiving.");
        }

        category.setStatus(CategoryStatus.ARCHIVED);
        category.setArchivedAt(LocalDateTime.now());

        Category updated = categoryRepository.save(category);
        return mapToDetailsResponse(updated);
    }

    /**
     * Delete Category:
     * Permanently deletes a category from the database if safe.
     * Enforces strict relational integrity: rejects deletion if dependent nominations,
     * cast votes, judge evaluations, or results exist.
     * Cleanly cascades and deletes associated judge assignments and criteria rubrics.
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Relational Integrity & Safe Delete Validation:
        // Reject deletion if active/historical award data depends on this category.
        if (nominationRepository != null && !nominationRepository.findByCategoryId(id).isEmpty()) {
            throw new InvalidStatusTransitionException(
                    "Cannot delete award category '" + category.getName() + "' because active nominations are associated with it. Please archive the category instead."
            );
        }

        if (voteRepository != null && voteRepository.countByCategoryId(id) > 0) {
            throw new InvalidStatusTransitionException(
                    "Cannot delete award category '" + category.getName() + "' because cast votes are associated with it. Please archive the category instead."
            );
        }

        if (evaluationRepository != null &&
                evaluationRepository.countByCategoryIdAndStatusIn(id, List.of(
                        EvaluationStatus.DRAFT,
                        EvaluationStatus.SUBMITTED,
                        EvaluationStatus.VERIFIED,
                        EvaluationStatus.LOCKED)) > 0) {
            throw new InvalidStatusTransitionException(
                    "Cannot delete award category '" + category.getName() + "' because judge evaluations are recorded for it. Please archive the category instead."
            );
        }

        if (resultSetRepository != null &&
                resultSetRepository.findFirstByCategoryIdOrderByVersionNoDesc(id).isPresent()) {
            throw new InvalidStatusTransitionException(
                    "Cannot delete award category '" + category.getName() + "' because calculated results exist for it. Please archive the category instead."
            );
        }

        // Cleanly delete associated child configuration records (judge assignments & criteria rubrics)
        categoryJudgeRepository.deleteByCategoryId(id);
        criterionRepository.deleteByCategoryId(id);
        if (judgeAssignmentRepository != null) {
            List<JudgeAssignment> jaList = judgeAssignmentRepository.findByCategoryId(id);
            if (!jaList.isEmpty()) {
                judgeAssignmentRepository.deleteAll(jaList);
            }
        }

        categoryRepository.delete(category);
        log.info("Category id: {} ('{}') permanently deleted from database along with rubrics and judge assignments.", id, category.getName());
    }

    /**
     * Dashboard KPI summary counts
     */
    @Transactional(readOnly = true)
    public CategoryStatsResponse getStats() {
        long total = categoryRepository.count();
        long draft = categoryRepository.countByStatus(CategoryStatus.DRAFT);
        long active = categoryRepository.countByStatus(CategoryStatus.ACTIVE);
        long votingOpen = categoryRepository.countByStatus(CategoryStatus.VOTING_OPEN);
        long votingClosed = categoryRepository.countByStatus(CategoryStatus.VOTING_CLOSED);
        long archived = categoryRepository.countByStatus(CategoryStatus.ARCHIVED);

        return new CategoryStatsResponse(total, draft, active, votingOpen, votingClosed, archived);
    }

    public List<AwardEventOption> getAvailableAwardEvents() {
        List<AwardEventOption> list = new ArrayList<>();
        KNOWN_EVENTS.forEach((id, name) -> list.add(new AwardEventOption(id, name, "2026 Season")));
        return list;
    }

    // =========================================================================
    // 2. JUDGE ASSIGNMENT OPERATIONS
    // =========================================================================

    @Transactional
    public JudgeResponse assignJudge(Long categoryId, Long judgeId, String assignedBy) {
        log.info("Assigning judge id: {} to category id: {} by: {}", judgeId, categoryId, assignedBy);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (category.getStatus() == CategoryStatus.ARCHIVED) {
            throw new BadRequestException("Cannot assign judges to an archived category.");
        }

        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Judge user not found with id: " + judgeId));

        if (judge.getRole() != Role.JUDGE) {
            throw new BadRequestException("User '" + judge.getEmail() + "' is not registered with role JUDGE (current role: " + judge.getRole() + ").");
        }

        if (categoryJudgeRepository.existsByCategoryIdAndJudgeId(categoryId, judgeId)) {
            throw new DuplicateResourceException("Judge '" + judge.getFullName() + "' is already assigned to category '" + category.getName() + "'.");
        }

        CategoryJudge assignment = new CategoryJudge(category, judge, assignedBy != null ? assignedBy : "Award Organizer");
        CategoryJudge saved = categoryJudgeRepository.save(assignment);
        log.info("Successfully assigned judge id: {} to category id: {}", judgeId, categoryId);

        // Synchronize with evaluation engine's judge_assignment table
        if (judgeAssignmentRepository != null) {
            judgeAssignmentRepository.findByCategoryIdAndJudgeId(categoryId, judgeId)
                    .ifPresentOrElse(
                            existing -> {
                                existing.setStatus(AssignmentStatus.ASSIGNED);
                                judgeAssignmentRepository.save(existing);
                            },
                            () -> {
                                JudgeAssignment ja = new JudgeAssignment();
                                ja.setCategoryId(categoryId);
                                ja.setJudgeId(judgeId);
                                ja.setJudgeName(judge.getFullName());
                                ja.setStatus(AssignmentStatus.ASSIGNED);
                                judgeAssignmentRepository.save(ja);
                            }
                    );
        }

        return new JudgeResponse(saved.getId(), judge.getId(), judge.getEmail(), judge.getFullName(), saved.getAssignedAt(), saved.getAssignedBy());
    }

    @Transactional
    public void removeJudge(Long categoryId, Long judgeId) {
        log.info("Removing judge id: {} from category id: {}", judgeId, categoryId);

        CategoryJudge assignment = categoryJudgeRepository.findByCategoryIdAndJudgeId(categoryId, judgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Judge assignment not found for category id: " + categoryId + " and judge id: " + judgeId));

        categoryJudgeRepository.delete(assignment);
        if (judgeAssignmentRepository != null) {
            judgeAssignmentRepository.findByCategoryIdAndJudgeId(categoryId, judgeId)
                    .ifPresent(judgeAssignmentRepository::delete);
        }
        log.info("Successfully removed judge id: {} from category id: {}", judgeId, categoryId);
    }

    @Transactional(readOnly = true)
    public List<JudgeResponse> getAssignedJudges(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        return categoryJudgeRepository.findByCategoryId(categoryId).stream()
                .map(cj -> new JudgeResponse(
                        cj.getId(),
                        cj.getJudge().getId(),
                        cj.getJudge().getEmail(),
                        cj.getJudge().getFullName(),
                        cj.getAssignedAt(),
                        cj.getAssignedBy()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JudgeUserOption> getAvailableJudges() {
        return userRepository.findByRole(Role.JUDGE).stream()
                .map(u -> new JudgeUserOption(u.getId(), u.getEmail(), u.getFullName()))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 3. CRITERIA CRUD OPERATIONS (STANDALONE)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<CategoryCriterionResponse> getCriteria(Long categoryId) {
        Category category = categoryRepository.findByIdWithCriteria(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        return category.getCriteria().stream()
                .map(c -> new CategoryCriterionResponse(
                        c.getId(),
                        c.getCriterionName(),
                        c.getDescription(),
                        c.getWeight(),
                        c.getMaxScore(),
                        c.getCreatedAt(),
                        c.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryCriterionResponse addCriterion(Long categoryId, CategoryCriterionRequest request) {
        Category category = categoryRepository.findByIdWithCriteria(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_OPEN) {
            throw new BadRequestException("Criteria cannot be modified for category in status: " + category.getStatus());
        }

        if (request.getWeight() == null || request.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Criterion weight must be greater than 0%");
        }
        if (request.getMaxScore() == null || request.getMaxScore() <= 0) {
            throw new BadRequestException("Maximum score must be greater than 0");
        }

        CategoryCriterion criterion = new CategoryCriterion();
        criterion.setCriterionName(request.getCriterionName().trim());
        criterion.setDescription(request.getDescription());
        criterion.setWeight(request.getWeight().setScale(2, RoundingMode.HALF_UP));
        criterion.setMaxScore(request.getMaxScore());
        category.addCriterion(criterion);

        Category saved = categoryRepository.save(category);
        CategoryCriterion lastAdded = saved.getCriteria().get(saved.getCriteria().size() - 1);

        return new CategoryCriterionResponse(
                lastAdded.getId(),
                lastAdded.getCriterionName(),
                lastAdded.getDescription(),
                lastAdded.getWeight(),
                lastAdded.getMaxScore(),
                lastAdded.getCreatedAt(),
                lastAdded.getUpdatedAt()
        );
    }

    @Transactional
    public CategoryCriterionResponse updateCriterion(Long categoryId, Long criterionId, CategoryCriterionRequest request) {
        Category category = categoryRepository.findByIdWithCriteria(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_OPEN) {
            throw new BadRequestException("Criteria cannot be modified for category in status: " + category.getStatus());
        }

        CategoryCriterion criterion = category.getCriteria().stream()
                .filter(c -> c.getId().equals(criterionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Criterion not found with id: " + criterionId));

        criterion.setCriterionName(request.getCriterionName().trim());
        criterion.setDescription(request.getDescription());
        criterion.setWeight(request.getWeight().setScale(2, RoundingMode.HALF_UP));
        criterion.setMaxScore(request.getMaxScore());

        categoryRepository.save(category);

        return new CategoryCriterionResponse(
                criterion.getId(),
                criterion.getCriterionName(),
                criterion.getDescription(),
                criterion.getWeight(),
                criterion.getMaxScore(),
                criterion.getCreatedAt(),
                criterion.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteCriterion(Long categoryId, Long criterionId) {
        Category category = categoryRepository.findByIdWithCriteria(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (category.getStatus() == CategoryStatus.ARCHIVED || category.getStatus() == CategoryStatus.VOTING_OPEN) {
            throw new BadRequestException("Criteria cannot be modified for category in status: " + category.getStatus());
        }

        CategoryCriterion criterion = category.getCriteria().stream()
                .filter(c -> c.getId().equals(criterionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Criterion not found with id: " + criterionId));

        category.removeCriterion(criterion);
        categoryRepository.save(category);
    }

    // =========================================================================
    // 4. ROLE-SPECIFIC VIEWS: NOMINEE, JUDGE, VOTER, ADMIN
    // =========================================================================

    /**
     * Nominee: Get available categories for nomination
     */
    @Transactional(readOnly = true)
    public List<NomineeCategoryResponse> getCategoriesForNominee(String search, Long eventId) {
        List<Category> list = categoryRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        return list.stream()
                .filter(c -> c.getStatus() != CategoryStatus.ARCHIVED && c.getStatus() != CategoryStatus.DRAFT)
                .filter(c -> eventId == null || c.getAwardEventId().equals(eventId))
                .filter(c -> search == null || search.trim().isEmpty() ||
                        c.getName().toLowerCase().contains(search.trim().toLowerCase()) ||
                        c.getDescription().toLowerCase().contains(search.trim().toLowerCase()))
                .map(c -> {
                    NomineeCategoryResponse resp = new NomineeCategoryResponse();
                    resp.setId(c.getId());
                    resp.setAwardEventId(c.getAwardEventId());
                    resp.setAwardEventName(getAwardEventName(c.getAwardEventId()));
                    resp.setName(c.getName());
                    resp.setDescription(c.getDescription());
                    resp.setRules(c.getRules());
                    resp.setNomineeEligibility(c.getNomineeEligibility());
                    resp.setNominationRequirements(c.getNominationRequirements());
                    resp.setNominationStartDate(c.getNominationStartDate());
                    resp.setNominationEndDate(c.getNominationEndDate());
                    resp.setStatus(c.getStatus());
                    boolean open = c.getStatus() == CategoryStatus.ACTIVE &&
                            (c.getNominationStartDate() == null || !now.isBefore(c.getNominationStartDate())) &&
                            (c.getNominationEndDate() == null || !now.isAfter(c.getNominationEndDate()));
                    resp.setNominationOpen(open);
                    return resp;
                })
                .collect(Collectors.toList());
    }

    /**
     * Nominee: View details of a specific category for nomination
     */
    @Transactional(readOnly = true)
    public NomineeCategoryResponse getCategoryForNominee(Long categoryId) {
        Category c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        LocalDateTime now = LocalDateTime.now();
        NomineeCategoryResponse resp = new NomineeCategoryResponse();
        resp.setId(c.getId());
        resp.setAwardEventId(c.getAwardEventId());
        resp.setAwardEventName(getAwardEventName(c.getAwardEventId()));
        resp.setName(c.getName());
        resp.setDescription(c.getDescription());
        resp.setRules(c.getRules());
        resp.setNomineeEligibility(c.getNomineeEligibility());
        resp.setNominationRequirements(c.getNominationRequirements());
        resp.setNominationStartDate(c.getNominationStartDate());
        resp.setNominationEndDate(c.getNominationEndDate());
        resp.setStatus(c.getStatus());
        boolean open = c.getStatus() == CategoryStatus.ACTIVE &&
                (c.getNominationStartDate() == null || !now.isBefore(c.getNominationStartDate())) &&
                (c.getNominationEndDate() == null || !now.isAfter(c.getNominationEndDate()));
        resp.setNominationOpen(open);
        return resp;
    }

    /**
     * Judge: View categories assigned strictly to this judge
     */
    @Transactional(readOnly = true)
    public List<JudgeCategoryResponse> getCategoriesForJudge(String judgeEmail, String search) {
        User judge = userRepository.findByEmail(judgeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Judge not found with email: " + judgeEmail));

        List<Category> categories;
        if (search != null && !search.trim().isEmpty()) {
            categories = categoryJudgeRepository.findCategoriesByJudgeIdAndSearch(judge.getId(), search.trim());
        } else {
            categories = categoryJudgeRepository.findCategoriesByJudgeId(judge.getId());
        }

        return categories.stream().map(this::mapToJudgeResponse).collect(Collectors.toList());
    }

    /**
     * Judge: View details of an assigned category
     */
    @Transactional(readOnly = true)
    public JudgeCategoryResponse getCategoryForJudge(Long categoryId, String judgeEmail) {
        User judge = userRepository.findByEmail(judgeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Judge not found with email: " + judgeEmail));

        if (!categoryJudgeRepository.existsByCategoryIdAndJudgeId(categoryId, judge.getId())) {
            throw new AccessDeniedException("Access denied. Category id " + categoryId + " is not assigned to judge: " + judgeEmail);
        }

        Category category = categoryRepository.findByIdWithCriteria(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        return mapToJudgeResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryCriterionResponse> getCriteriaForJudge(Long categoryId, String judgeEmail) {
        return getCategoryForJudge(categoryId, judgeEmail).getCriteria();
    }

    /**
     * Public Voter: View active/voting categories
     */
    @Transactional(readOnly = true)
    public List<VoterCategoryResponse> getCategoriesForVoter(String search, Long eventId) {
        List<Category> list = categoryRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        return list.stream()
                .filter(c -> c.getStatus() == CategoryStatus.ACTIVE || c.getStatus() == CategoryStatus.VOTING_OPEN)
                .filter(c -> eventId == null || c.getAwardEventId().equals(eventId))
                .filter(c -> search == null || search.trim().isEmpty() ||
                        c.getName().toLowerCase().contains(search.trim().toLowerCase()) ||
                        c.getDescription().toLowerCase().contains(search.trim().toLowerCase()))
                .map(c -> {
                    VoterCategoryResponse resp = new VoterCategoryResponse();
                    resp.setId(c.getId());
                    resp.setAwardEventId(c.getAwardEventId());
                    resp.setAwardEventName(getAwardEventName(c.getAwardEventId()));
                    resp.setName(c.getName());
                    resp.setDescription(c.getDescription());
                    resp.setRules(c.getRules());
                    resp.setVoterEligibility(c.getVoterEligibility());
                    resp.setVotingStartDate(c.getVotingStartDate());
                    resp.setVotingEndDate(c.getVotingEndDate());
                    resp.setStatus(c.getStatus());
                    boolean open = c.getStatus() == CategoryStatus.VOTING_OPEN &&
                            (c.getVotingStartDate() == null || !now.isBefore(c.getVotingStartDate())) &&
                            (c.getVotingEndDate() == null || !now.isAfter(c.getVotingEndDate()));
                    resp.setVotingOpen(open);
                    return resp;
                })
                .collect(Collectors.toList());
    }

    /**
     * Public Voter: View single category details
     */
    @Transactional(readOnly = true)
    public VoterCategoryResponse getCategoryForVoter(Long categoryId) {
        Category c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        LocalDateTime now = LocalDateTime.now();
        VoterCategoryResponse resp = new VoterCategoryResponse();
        resp.setId(c.getId());
        resp.setAwardEventId(c.getAwardEventId());
        resp.setAwardEventName(getAwardEventName(c.getAwardEventId()));
        resp.setName(c.getName());
        resp.setDescription(c.getDescription());
        resp.setRules(c.getRules());
        resp.setVoterEligibility(c.getVoterEligibility());
        resp.setVotingStartDate(c.getVotingStartDate());
        resp.setVotingEndDate(c.getVotingEndDate());
        resp.setStatus(c.getStatus());
        boolean open = c.getStatus() == CategoryStatus.VOTING_OPEN &&
                (c.getVotingStartDate() == null || !now.isBefore(c.getVotingStartDate())) &&
                (c.getVotingEndDate() == null || !now.isAfter(c.getVotingEndDate()));
        resp.setVotingOpen(open);
        return resp;
    }

    /**
     * Admin: Read-only category monitoring
     */
    @Transactional(readOnly = true)
    public Page<AdminCategoryResponse> getCategoriesForAdmin(String search, CategoryStatus status, Long eventId, Pageable pageable) {
        Page<Category> page = categoryRepository.findCategories(eventId, status, true, search != null ? search.trim() : "", pageable);
        return page.map(c -> {
            AdminCategoryResponse r = new AdminCategoryResponse();
            r.setId(c.getId());
            r.setAwardEventId(c.getAwardEventId());
            r.setAwardEventName(getAwardEventName(c.getAwardEventId()));
            r.setName(c.getName());
            r.setDescription(c.getDescription());
            r.setStatus(c.getStatus());
            r.setCriteriaCount(c.getCriteria() != null ? c.getCriteria().size() : 0);
            r.setJudgeCount((int) categoryJudgeRepository.countByCategoryId(c.getId()));
            r.setCreatedAt(c.getCreatedAt());
            r.setUpdatedAt(c.getUpdatedAt());
            r.setArchivedAt(c.getArchivedAt());
            r.setCreatedBy(c.getCreatedBy());
            return r;
        });
    }

    @Transactional(readOnly = true)
    public CategoryDetailsResponse getCategoryForAdmin(Long categoryId) {
        return getCategoryById(categoryId);
    }

    // =========================================================================
    // 5. VALIDATION & MAPPING HELPERS
    // =========================================================================

    private void validateScheduleDates(
            LocalDateTime nomStart,
            LocalDateTime nomEnd,
            LocalDateTime voteStart,
            LocalDateTime voteEnd,
            LocalDateTime resultPub
    ) {
        if (nomStart != null && nomEnd != null && !nomEnd.isAfter(nomStart)) {
            throw new BadRequestException("Nomination end date (" + nomEnd + ") must be strictly after nomination start date (" + nomStart + ").");
        }
        if (voteStart != null && voteEnd != null && !voteEnd.isAfter(voteStart)) {
            throw new BadRequestException("Voting end date (" + voteEnd + ") must be strictly after voting start date (" + voteStart + ").");
        }
        if (nomEnd != null && voteStart != null && voteStart.isBefore(nomEnd)) {
            throw new BadRequestException("Voting cannot begin (" + voteStart + ") before nomination period ends (" + nomEnd + ").");
        }
        if (voteEnd != null && resultPub != null && resultPub.isBefore(voteEnd)) {
            throw new BadRequestException("Result publication date (" + resultPub + ") must be after voting concludes (" + voteEnd + ").");
        }
    }

    private void validateCriteria(List<CategoryCriterionRequest> criteria) {
        if (criteria == null || criteria.isEmpty()) {
            throw new BadRequestException("At least one judging criterion is required.");
        }

        BigDecimal totalWeight = BigDecimal.ZERO;
        for (CategoryCriterionRequest c : criteria) {
            if (c.getWeight() == null || c.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Criterion weight must be greater than 0%.");
            }
            if (c.getMaxScore() == null || c.getMaxScore() <= 0) {
                throw new BadRequestException("Criterion max score must be greater than 0.");
            }
            totalWeight = totalWeight.add(c.getWeight());
        }

        if (totalWeight.compareTo(new BigDecimal("100.00")) != 0 &&
            totalWeight.compareTo(new BigDecimal("100")) != 0) {
            throw new BadRequestException("Total criterion weight must equal 100%. Current total: " + totalWeight + "%");
        }
    }

    private void validateStatusTransition(Category category, CategoryStatus current, CategoryStatus target) {
        switch (current) {
            case DRAFT:
                if (target != CategoryStatus.ACTIVE && target != CategoryStatus.ARCHIVED) {
                    throw new InvalidStatusTransitionException("DRAFT category can only transition to ACTIVE or ARCHIVED. Cannot jump to " + target);
                }
                break;
            case ACTIVE:
                if (target != CategoryStatus.VOTING_OPEN && target != CategoryStatus.ARCHIVED) {
                    throw new InvalidStatusTransitionException("ACTIVE category can only transition to VOTING_OPEN or ARCHIVED. Cannot jump to " + target);
                }
                break;
            case VOTING_OPEN:
                if (target != CategoryStatus.VOTING_CLOSED) {
                    throw new InvalidStatusTransitionException("VOTING_OPEN category must transition to VOTING_CLOSED before archiving. Cannot jump directly to " + target);
                }
                break;
            case VOTING_CLOSED:
                if (target != CategoryStatus.ARCHIVED) {
                    throw new InvalidStatusTransitionException("VOTING_CLOSED category can only transition to ARCHIVED. Cannot jump to " + target);
                }
                break;
            case ARCHIVED:
                throw new InvalidStatusTransitionException("ARCHIVED is a terminal state. Category cannot be transitioned out of ARCHIVED.");
        }
    }

    private CategoryResponse mapToSummaryResponse(Category category) {
        CategoryResponse dto = new CategoryResponse();
        dto.setId(category.getId());
        dto.setAwardEventId(category.getAwardEventId());
        dto.setAwardEventName(getAwardEventName(category.getAwardEventId()));
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setStatus(category.getStatus());
        dto.setNominationStartDate(category.getNominationStartDate());
        dto.setNominationEndDate(category.getNominationEndDate());
        dto.setVotingStartDate(category.getVotingStartDate());
        dto.setVotingEndDate(category.getVotingEndDate());
        dto.setResultPublicationDate(category.getResultPublicationDate());
        dto.setCriteriaCount(category.getCriteria() != null ? category.getCriteria().size() : 0);
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setArchivedAt(category.getArchivedAt());
        return dto;
    }

    private CategoryDetailsResponse mapToDetailsResponse(Category category) {
        CategoryDetailsResponse dto = new CategoryDetailsResponse();
        dto.setId(category.getId());
        dto.setAwardEventId(category.getAwardEventId());
        dto.setAwardEventName(getAwardEventName(category.getAwardEventId()));
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setRules(category.getRules());
        dto.setNomineeEligibility(category.getNomineeEligibility());
        dto.setVoterEligibility(category.getVoterEligibility());
        dto.setNominationRequirements(category.getNominationRequirements());
        dto.setNominationStartDate(category.getNominationStartDate());
        dto.setNominationEndDate(category.getNominationEndDate());
        dto.setVotingStartDate(category.getVotingStartDate());
        dto.setVotingEndDate(category.getVotingEndDate());
        dto.setResultPublicationDate(category.getResultPublicationDate());
        dto.setStatus(category.getStatus());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setArchivedAt(category.getArchivedAt());
        dto.setCreatedBy(category.getCreatedBy());

        List<CategoryCriterionResponse> criteriaList = new ArrayList<>();
        if (category.getCriteria() != null) {
            for (CategoryCriterion c : category.getCriteria()) {
                criteriaList.add(new CategoryCriterionResponse(
                        c.getId(),
                        c.getCriterionName(),
                        c.getDescription(),
                        c.getWeight(),
                        c.getMaxScore(),
                        c.getCreatedAt(),
                        c.getUpdatedAt()
                ));
            }
        }
        dto.setCriteria(criteriaList);
        dto.setCriteriaCount(criteriaList.size());

        // Populate assigned judges
        if (category.getId() != null && categoryJudgeRepository != null) {
            try {
                List<CategoryJudge> judges = categoryJudgeRepository.findByCategoryId(category.getId());
                if (judges != null) {
                    dto.setAssignedJudges(judges.stream().map(cj -> new JudgeResponse(
                            cj.getId(),
                            cj.getJudge() != null ? cj.getJudge().getId() : null,
                            cj.getJudge() != null ? cj.getJudge().getEmail() : null,
                            cj.getJudge() != null ? cj.getJudge().getFullName() : null,
                            cj.getAssignedAt(),
                            cj.getAssignedBy()
                    )).collect(Collectors.toList()));
                }
            } catch (Exception ignored) {
                // Keep empty if repository not configured in test environment
            }
        }

        return dto;
    }

    private JudgeCategoryResponse mapToJudgeResponse(Category category) {
        JudgeCategoryResponse dto = new JudgeCategoryResponse();
        dto.setId(category.getId());
        dto.setAwardEventId(category.getAwardEventId());
        dto.setAwardEventName(getAwardEventName(category.getAwardEventId()));
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setRules(category.getRules());
        dto.setNomineeEligibility(category.getNomineeEligibility());
        dto.setNominationStartDate(category.getNominationStartDate());
        dto.setNominationEndDate(category.getNominationEndDate());
        dto.setVotingStartDate(category.getVotingStartDate());
        dto.setVotingEndDate(category.getVotingEndDate());
        dto.setStatus(category.getStatus());

        List<CategoryCriterionResponse> criteriaList = new ArrayList<>();
        if (category.getCriteria() != null) {
            for (CategoryCriterion c : category.getCriteria()) {
                criteriaList.add(new CategoryCriterionResponse(
                        c.getId(),
                        c.getCriterionName(),
                        c.getDescription(),
                        c.getWeight(),
                        c.getMaxScore(),
                        c.getCreatedAt(),
                        c.getUpdatedAt()
                ));
            }
        }
        dto.setCriteria(criteriaList);
        return dto;
    }
}
