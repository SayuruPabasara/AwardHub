package com.awardhub.category.service;

import com.awardhub.category.dto.CategoryCriterionRequest;
import com.awardhub.category.dto.CategoryDetailsResponse;
import com.awardhub.category.dto.CategoryRequest;
import com.awardhub.category.dto.CategoryUpdateRequest;
import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryCriterion;
import com.awardhub.category.repository.CategoryCriterionRepository;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.DuplicateResourceException;
import com.awardhub.common.exception.InvalidStatusTransitionException;
import com.awardhub.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryCriterionRepository criterionRepository;

    @Mock
    private com.awardhub.category.repository.CategoryJudgeRepository categoryJudgeRepository;

    @Mock
    private com.awardhub.user.repository.UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    private CategoryRequest validRequest;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        validRequest = new CategoryRequest();
        validRequest.setAwardEventId(1L);
        validRequest.setName("Best Emerging Tech Innovator");
        validRequest.setDescription("Recognizing high-impact technological breakthroughs.");
        validRequest.setRules("Open to all certified startups.");
        validRequest.setNomineeEligibility("Founders or Lead Engineers.");
        validRequest.setVoterEligibility("Verified platform users.");
        validRequest.setNominationRequirements("Portfolio link, code sample.");
        validRequest.setNominationStartDate(now.plusDays(1));
        validRequest.setNominationEndDate(now.plusDays(10));
        validRequest.setVotingStartDate(now.plusDays(15));
        validRequest.setVotingEndDate(now.plusDays(25));
        validRequest.setResultPublicationDate(now.plusDays(30));
        validRequest.setStatus(CategoryStatus.DRAFT);
        validRequest.setCreatedBy("Test Organizer");

        List<CategoryCriterionRequest> criteria = new ArrayList<>();
        criteria.add(new CategoryCriterionRequest("Innovation", "Novelty of solution", new BigDecimal("40.00"), 10));
        criteria.add(new CategoryCriterionRequest("Impact", "Market impact", new BigDecimal("35.00"), 10));
        criteria.add(new CategoryCriterionRequest("Execution", "Code quality", new BigDecimal("25.00"), 10));
        validRequest.setCriteria(criteria);
    }

    @Test
    @DisplayName("1. Create Category - Success")
    void testCreateCategory_Success() {
        when(categoryRepository.existsByAwardEventIdAndName(1L, "Best Emerging Tech Innovator")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category cat = invocation.getArgument(0);
            cat.setId(100L);
            return cat;
        });

        CategoryDetailsResponse response = categoryService.createCategory(validRequest);

        assertNotNull(response);
        assertEquals("Best Emerging Tech Innovator", response.getName());
        assertEquals(CategoryStatus.DRAFT, response.getStatus());
        assertEquals(3, response.getCriteriaCount());
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("2. Duplicate Category - Throws DuplicateResourceException")
    void testCreateCategory_DuplicateName() {
        when(categoryRepository.existsByAwardEventIdAndName(1L, "Best Emerging Tech Innovator")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.createCategory(validRequest));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("3. Get Category - Success")
    void testGetCategoryDetails_Success() {
        Category category = new Category();
        category.setId(10L);
        category.setAwardEventId(1L);
        category.setName("Outstanding Researcher");
        category.setDescription("Research award");
        category.setStatus(CategoryStatus.ACTIVE);
        category.setNominationStartDate(now);
        category.setNominationEndDate(now.plusDays(5));
        category.setVotingStartDate(now.plusDays(6));
        category.setVotingEndDate(now.plusDays(10));
        category.setResultPublicationDate(now.plusDays(15));

        when(categoryRepository.findByIdWithCriteria(10L)).thenReturn(Optional.of(category));

        CategoryDetailsResponse response = categoryService.getCategoryDetails(10L);
        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Outstanding Researcher", response.getName());
    }

    @Test
    @DisplayName("4. Non-existing Category - Throws ResourceNotFoundException")
    void testGetCategoryDetails_NotFound() {
        when(categoryRepository.findByIdWithCriteria(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryDetails(999L));
    }

    @Test
    @DisplayName("5. Update Category - Success")
    void testUpdateCategory_Success() {
        Category existing = new Category();
        existing.setId(5L);
        existing.setAwardEventId(1L);
        existing.setName("Old Name");
        existing.setDescription("Old Description");
        existing.setStatus(CategoryStatus.DRAFT);
        existing.setNominationStartDate(now.plusDays(1));
        existing.setNominationEndDate(now.plusDays(10));
        existing.setVotingStartDate(now.plusDays(15));
        existing.setVotingEndDate(now.plusDays(25));
        existing.setResultPublicationDate(now.plusDays(30));

        when(categoryRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByAwardEventIdAndNameAndIdNot(1L, "Updated Name", 5L)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(existing);

        CategoryUpdateRequest updateRequest = new CategoryUpdateRequest();
        updateRequest.setAwardEventId(1L);
        updateRequest.setName("Updated Name");
        updateRequest.setDescription("Updated Description");
        updateRequest.setNominationStartDate(now.plusDays(2));
        updateRequest.setNominationEndDate(now.plusDays(11));
        updateRequest.setVotingStartDate(now.plusDays(16));
        updateRequest.setVotingEndDate(now.plusDays(26));
        updateRequest.setResultPublicationDate(now.plusDays(31));
        updateRequest.setCriteria(Arrays.asList(
                new CategoryCriterionRequest("Metric A", "Desc", new BigDecimal("50.00"), 10),
                new CategoryCriterionRequest("Metric B", "Desc", new BigDecimal("50.00"), 10)
        ));

        CategoryDetailsResponse updated = categoryService.updateCategory(5L, updateRequest);
        assertNotNull(updated);
        assertEquals("Updated Name", existing.getName());
    }

    @Test
    @DisplayName("6. Archive Category - Success")
    void testArchiveCategory_Success() {
        Category category = new Category();
        category.setId(15L);
        category.setStatus(CategoryStatus.ACTIVE);

        when(categoryRepository.findById(15L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryDetailsResponse response = categoryService.archiveCategory(15L);
        assertEquals(CategoryStatus.ARCHIVED, category.getStatus());
        assertNotNull(category.getArchivedAt());
    }

    @Test
    @DisplayName("7. Invalid Dates - Nomination End before Start throws BadRequestException")
    void testInvalidDates_NominationEndBeforeStart() {
        validRequest.setNominationStartDate(now.plusDays(10));
        validRequest.setNominationEndDate(now.plusDays(5)); // invalid!

        when(categoryRepository.existsByAwardEventIdAndName(anyLong(), anyString())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> categoryService.createCategory(validRequest));
    }

    @Test
    @DisplayName("8. Invalid Dates - Voting Start before Nomination End throws BadRequestException")
    void testInvalidDates_VotingBeforeNomination() {
        validRequest.setNominationStartDate(now.plusDays(1));
        validRequest.setNominationEndDate(now.plusDays(15));
        validRequest.setVotingStartDate(now.plusDays(10)); // overlaps / before nomination end!
        validRequest.setVotingEndDate(now.plusDays(20));
        validRequest.setResultPublicationDate(now.plusDays(25));

        when(categoryRepository.existsByAwardEventIdAndName(anyLong(), anyString())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> categoryService.createCategory(validRequest));
    }

    @Test
    @DisplayName("9. Invalid Judging Weights - Total != 100% throws BadRequestException")
    void testInvalidWeights_NotEqual100() {
        validRequest.getCriteria().clear();
        validRequest.getCriteria().add(new CategoryCriterionRequest("Criterion 1", "Desc", new BigDecimal("40.00"), 10));
        validRequest.getCriteria().add(new CategoryCriterionRequest("Criterion 2", "Desc", new BigDecimal("40.00"), 10));
        // Total is 80%, not 100%!

        when(categoryRepository.existsByAwardEventIdAndName(anyLong(), anyString())).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> categoryService.createCategory(validRequest));
        assertTrue(ex.getMessage().contains("Total criterion weight must equal 100%"));
    }

    @Test
    @DisplayName("10. Criteria Validation - Non-positive weight throws BadRequestException")
    void testCriteriaValidation_ZeroWeight() {
        validRequest.getCriteria().clear();
        validRequest.getCriteria().add(new CategoryCriterionRequest("Criterion 1", "Desc", new BigDecimal("0.00"), 10));

        when(categoryRepository.existsByAwardEventIdAndName(anyLong(), anyString())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> categoryService.createCategory(validRequest));
    }

    @Test
    @DisplayName("11. Status Transition - DRAFT to ACTIVE is allowed with criteria")
    void testStatusTransition_DraftToActive() {
        Category category = new Category();
        category.setId(20L);
        category.setStatus(CategoryStatus.DRAFT);
        category.addCriterion(new CategoryCriterion(category, "Crit", "Desc", new BigDecimal("100.00"), 10));

        when(categoryRepository.findByIdWithCriteria(20L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryDetailsResponse response = categoryService.updateStatus(20L, CategoryStatus.ACTIVE);
        assertEquals(CategoryStatus.ACTIVE, category.getStatus());
    }

    @Test
    @DisplayName("12. Invalid Status Transition - VOTING_OPEN to ARCHIVED directly throws InvalidStatusTransitionException")
    void testStatusTransition_VotingOpenToArchived_Disallowed() {
        Category category = new Category();
        category.setId(22L);
        category.setStatus(CategoryStatus.VOTING_OPEN);

        when(categoryRepository.findByIdWithCriteria(22L)).thenReturn(Optional.of(category));

        assertThrows(InvalidStatusTransitionException.class, () -> categoryService.updateStatus(22L, CategoryStatus.ARCHIVED));
    }

    @Test
    @DisplayName("13. Delete Category - Draft category is permanently deleted with rubrics and judges")
    void testDeleteCategory_DraftSuccess() {
        Category category = new Category();
        category.setId(30L);
        category.setName("Best Mobile App");
        category.setStatus(CategoryStatus.DRAFT);

        when(categoryRepository.findById(30L)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(30L);

        verify(categoryJudgeRepository, times(1)).deleteByCategoryId(30L);
        verify(criterionRepository, times(1)).deleteByCategoryId(30L);
        verify(categoryRepository, times(1)).delete(category);
    }

    @Test
    @DisplayName("14. Delete Category - Active or Archived category is permanently deleted with cascade")
    void testDeleteCategory_Active_DeletesSuccessfully() {
        Category category = new Category();
        category.setId(31L);
        category.setName("Best AI Startup");
        category.setStatus(CategoryStatus.ACTIVE);

        when(categoryRepository.findById(31L)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(31L);

        verify(categoryJudgeRepository, times(1)).deleteByCategoryId(31L);
        verify(criterionRepository, times(1)).deleteByCategoryId(31L);
        verify(categoryRepository, times(1)).delete(category);
    }

    @Test
    @DisplayName("15. Delete Category - Non-existent ID throws ResourceNotFoundException")
    void testDeleteCategory_NotFound_ThrowsResourceNotFoundException() {
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.deleteCategory(999L));
        verify(categoryRepository, never()).delete(any());
        verify(categoryJudgeRepository, never()).deleteByCategoryId(anyLong());
        verify(criterionRepository, never()).deleteByCategoryId(anyLong());
    }

    @Test
    @DisplayName("16. Assign Judge - Success")
    void testAssignJudge_Success() {
        Category category = new Category();
        category.setId(40L);
        category.setName("Tech Category");
        category.setStatus(CategoryStatus.ACTIVE);

        com.awardhub.user.entity.User judge = new com.awardhub.user.entity.User(
                5L, "judge@awardhub.com", "pass", "Dr. Vance", com.awardhub.common.enums.Role.JUDGE
        );

        when(categoryRepository.findById(40L)).thenReturn(Optional.of(category));
        when(userRepository.findById(5L)).thenReturn(Optional.of(judge));
        when(categoryJudgeRepository.existsByCategoryIdAndJudgeId(40L, 5L)).thenReturn(false);
        when(categoryJudgeRepository.save(any())).thenAnswer(inv -> {
            com.awardhub.category.entity.CategoryJudge cj = inv.getArgument(0);
            cj.setId(101L);
            return cj;
        });

        com.awardhub.category.dto.JudgeResponse response = categoryService.assignJudge(40L, 5L, "Test Organizer");
        assertNotNull(response);
        assertEquals(5L, response.getJudgeId());
        assertEquals("Dr. Vance", response.getFullName());
    }

    @Test
    @DisplayName("17. Assign Judge - Duplicate Assignment Throws DuplicateResourceException")
    void testAssignJudge_AlreadyAssigned_ThrowsDuplicate() {
        Category category = new Category();
        category.setId(40L);
        category.setName("Tech Category");
        category.setStatus(CategoryStatus.ACTIVE);

        com.awardhub.user.entity.User judge = new com.awardhub.user.entity.User(
                5L, "judge@awardhub.com", "pass", "Dr. Vance", com.awardhub.common.enums.Role.JUDGE
        );

        when(categoryRepository.findById(40L)).thenReturn(Optional.of(category));
        when(userRepository.findById(5L)).thenReturn(Optional.of(judge));
        when(categoryJudgeRepository.existsByCategoryIdAndJudgeId(40L, 5L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.assignJudge(40L, 5L, "Test Organizer"));
    }

    @Test
    @DisplayName("18. Assign Judge - User Without JUDGE Role Throws BadRequestException")
    void testAssignJudge_NotAJudge_ThrowsBadRequest() {
        Category category = new Category();
        category.setId(40L);
        category.setStatus(CategoryStatus.ACTIVE);

        com.awardhub.user.entity.User nonJudge = new com.awardhub.user.entity.User(
                6L, "voter@awardhub.com", "pass", "Voter Guy", com.awardhub.common.enums.Role.VOTER
        );

        when(categoryRepository.findById(40L)).thenReturn(Optional.of(category));
        when(userRepository.findById(6L)).thenReturn(Optional.of(nonJudge));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> categoryService.assignJudge(40L, 6L, "Test Organizer"));
        assertTrue(ex.getMessage().contains("is not registered with role JUDGE"));
    }

    @Test
    @DisplayName("19. Judge Category Access - Unassigned Category Throws AccessDeniedException")
    void testJudgeCategoryAccess_Unassigned_ThrowsAccessDenied() {
        com.awardhub.user.entity.User judge = new com.awardhub.user.entity.User(
                5L, "judge@awardhub.com", "pass", "Dr. Vance", com.awardhub.common.enums.Role.JUDGE
        );

        when(userRepository.findByEmail("judge@awardhub.com")).thenReturn(Optional.of(judge));
        when(categoryJudgeRepository.existsByCategoryIdAndJudgeId(50L, 5L)).thenReturn(false);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> categoryService.getCategoryForJudge(50L, "judge@awardhub.com"));
    }

    @Test
    @DisplayName("20. Nominee Categories - Only Active categories are returned")
    void testGetCategoriesForNominee() {
        Category activeCat = new Category();
        activeCat.setId(1L);
        activeCat.setAwardEventId(1L);
        activeCat.setName("Active Category");
        activeCat.setDescription("Desc");
        activeCat.setStatus(CategoryStatus.ACTIVE);

        Category draftCat = new Category();
        draftCat.setId(2L);
        draftCat.setAwardEventId(1L);
        draftCat.setName("Draft Category");
        draftCat.setDescription("Desc");
        draftCat.setStatus(CategoryStatus.DRAFT);

        when(categoryRepository.findAll()).thenReturn(Arrays.asList(activeCat, draftCat));

        java.util.List<com.awardhub.category.dto.NomineeCategoryResponse> nomineeCats =
                categoryService.getCategoriesForNominee("", 1L);

        assertEquals(1, nomineeCats.size());
        assertEquals("Active Category", nomineeCats.get(0).getName());
    }
}
