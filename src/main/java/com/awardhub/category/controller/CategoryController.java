package com.awardhub.category.controller;

import com.awardhub.category.dto.*;
import com.awardhub.category.service.CategoryService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Create a new award category with criteria rubric
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryDetailsResponse created = categoryService.createCategory(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    /**
     * Get paginated and filtered categories for Organizer
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getCategories(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) CategoryStatus status,
            @RequestParam(required = false, defaultValue = "false") Boolean includeArchived,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = sortParams[0];

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        Page<CategoryResponse> categories = categoryService.getCategories(eventId, status, includeArchived, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get category details by id
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> getCategoryDetails(@PathVariable Long id) {
        CategoryDetailsResponse details = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category details retrieved successfully", details));
    }

    /**
     * Update an existing category
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        CategoryDetailsResponse updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    /**
     * Update category lifecycle status
     * PATCH /api/categories/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusUpdateRequest request
    ) {
        CategoryDetailsResponse updated = categoryService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Category status updated to " + request.getStatus(), updated));
    }

    /**
     * Soft archive a category
     * PATCH /api/categories/{id}/archive
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> archiveCategory(@PathVariable Long id) {
        CategoryDetailsResponse archived = categoryService.archiveCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category archived successfully", archived));
    }

    /**
     * Physical delete category (only allowed if DRAFT and has no dependent records)
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    /**
     * Get category summary counts for dashboard
     * GET /api/categories/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CategoryStatsResponse>> getCategoryStats() {
        CategoryStatsResponse stats = categoryService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Category stats retrieved successfully", stats));
    }

    /**
     * Get available award events for selection dropdowns
     * GET /api/categories/events
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<AwardEventOption>>> getAvailableAwardEvents() {
        List<AwardEventOption> events = categoryService.getAvailableAwardEvents();
        return ResponseEntity.ok(ApiResponse.success("Available award events retrieved successfully", events));
    }

    // =========================================================================
    // JUDGE ASSIGNMENT ENDPOINTS
    // =========================================================================

    /**
     * Assign a judge to a category
     * POST /api/categories/{id}/judges
     */
    @PostMapping("/{id}/judges")
    public ResponseEntity<ApiResponse<JudgeResponse>> assignJudge(
            @PathVariable Long id,
            @Valid @RequestBody JudgeAssignmentRequest request,
            Principal principal
    ) {
        String assignedBy = principal != null ? principal.getName() : "Award Organizer";
        JudgeResponse response = categoryService.assignJudge(id, request.getJudgeId(), assignedBy);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Judge assigned to category successfully", response));
    }

    /**
     * Get judges assigned to a category
     * GET /api/categories/{id}/judges
     */
    @GetMapping("/{id}/judges")
    public ResponseEntity<ApiResponse<List<JudgeResponse>>> getAssignedJudges(@PathVariable Long id) {
        List<JudgeResponse> judges = categoryService.getAssignedJudges(id);
        return ResponseEntity.ok(ApiResponse.success("Assigned judges retrieved successfully", judges));
    }

    /**
     * Remove a judge assignment from a category
     * DELETE /api/categories/{id}/judges/{judgeId}
     */
    @DeleteMapping("/{id}/judges/{judgeId}")
    public ResponseEntity<ApiResponse<Void>> removeJudge(
            @PathVariable Long id,
            @PathVariable Long judgeId
    ) {
        categoryService.removeJudge(id, judgeId);
        return ResponseEntity.ok(ApiResponse.success("Judge removed from category successfully", null));
    }

    /**
     * Get list of all available registered judges to assign
     * GET /api/categories/judges/available
     */
    @GetMapping("/judges/available")
    public ResponseEntity<ApiResponse<List<JudgeUserOption>>> getAvailableJudges() {
        List<JudgeUserOption> judges = categoryService.getAvailableJudges();
        return ResponseEntity.ok(ApiResponse.success("Available judges retrieved successfully", judges));
    }

    // =========================================================================
    // CRITERIA CRUD ENDPOINTS
    // =========================================================================

    /**
     * Get all criteria for a category
     * GET /api/categories/{id}/criteria
     */
    @GetMapping("/{id}/criteria")
    public ResponseEntity<ApiResponse<List<CategoryCriterionResponse>>> getCriteria(@PathVariable Long id) {
        List<CategoryCriterionResponse> criteria = categoryService.getCriteria(id);
        return ResponseEntity.ok(ApiResponse.success("Category criteria retrieved successfully", criteria));
    }

    /**
     * Add a single criterion to category
     * POST /api/categories/{id}/criteria
     */
    @PostMapping("/{id}/criteria")
    public ResponseEntity<ApiResponse<CategoryCriterionResponse>> addCriterion(
            @PathVariable Long id,
            @Valid @RequestBody CategoryCriterionRequest request
    ) {
        CategoryCriterionResponse created = categoryService.addCriterion(id, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Criterion added successfully", created));
    }

    /**
     * Update a single criterion in category
     * PUT /api/categories/{id}/criteria/{criterionId}
     */
    @PutMapping("/{id}/criteria/{criterionId}")
    public ResponseEntity<ApiResponse<CategoryCriterionResponse>> updateCriterion(
            @PathVariable Long id,
            @PathVariable Long criterionId,
            @Valid @RequestBody CategoryCriterionRequest request
    ) {
        CategoryCriterionResponse updated = categoryService.updateCriterion(id, criterionId, request);
        return ResponseEntity.ok(ApiResponse.success("Criterion updated successfully", updated));
    }

    /**
     * Delete a criterion from category
     * DELETE /api/categories/{id}/criteria/{criterionId}
     */
    @DeleteMapping("/{id}/criteria/{criterionId}")
    public ResponseEntity<ApiResponse<Void>> deleteCriterion(
            @PathVariable Long id,
            @PathVariable Long criterionId
    ) {
        categoryService.deleteCriterion(id, criterionId);
        return ResponseEntity.ok(ApiResponse.success("Criterion deleted successfully", null));
    }
}
