package com.awardhub.category.controller;

import com.awardhub.category.dto.*;
import com.awardhub.category.service.CategoryService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.response.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class RoleCategoryController {

    private final CategoryService categoryService;

    public RoleCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // =========================================================================
    // ORGANIZER ALIAS ENDPOINTS
    // =========================================================================

    @GetMapping("/api/organizer/categories")
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getOrganizerCategories(
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

        return ResponseEntity.ok(ApiResponse.success("Organizer categories retrieved successfully", categories));
    }

    // =========================================================================
    // NOMINEE ENDPOINTS
    // =========================================================================

    @GetMapping("/api/nominee/categories")
    public ResponseEntity<ApiResponse<List<NomineeCategoryResponse>>> getNomineeCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long eventId
    ) {
        List<NomineeCategoryResponse> list = categoryService.getCategoriesForNominee(search, eventId);
        return ResponseEntity.ok(ApiResponse.success("Available categories for nomination retrieved successfully", list));
    }

    @GetMapping("/api/nominee/categories/{id}")
    public ResponseEntity<ApiResponse<NomineeCategoryResponse>> getNomineeCategoryDetails(@PathVariable Long id) {
        NomineeCategoryResponse details = categoryService.getCategoryForNominee(id);
        return ResponseEntity.ok(ApiResponse.success("Category nomination details retrieved successfully", details));
    }

    // =========================================================================
    // JUDGE ENDPOINTS
    // =========================================================================

    @GetMapping("/api/judge/categories")
    public ResponseEntity<ApiResponse<List<JudgeCategoryResponse>>> getJudgeAssignedCategories(
            @RequestParam(required = false) String search,
            Principal principal
    ) {
        String judgeEmail = principal != null ? principal.getName() : "";
        List<JudgeCategoryResponse> list = categoryService.getCategoriesForJudge(judgeEmail, search);
        return ResponseEntity.ok(ApiResponse.success("Assigned categories retrieved successfully", list));
    }

    @GetMapping("/api/judge/categories/{id}")
    public ResponseEntity<ApiResponse<JudgeCategoryResponse>> getJudgeCategoryDetails(
            @PathVariable Long id,
            Principal principal
    ) {
        String judgeEmail = principal != null ? principal.getName() : "";
        JudgeCategoryResponse details = categoryService.getCategoryForJudge(id, judgeEmail);
        return ResponseEntity.ok(ApiResponse.success("Judge category details retrieved successfully", details));
    }

    @GetMapping("/api/judge/categories/{id}/criteria")
    public ResponseEntity<ApiResponse<List<CategoryCriterionResponse>>> getJudgeCategoryCriteria(
            @PathVariable Long id,
            Principal principal
    ) {
        String judgeEmail = principal != null ? principal.getName() : "";
        List<CategoryCriterionResponse> criteria = categoryService.getCriteriaForJudge(id, judgeEmail);
        return ResponseEntity.ok(ApiResponse.success("Category judging criteria retrieved successfully", criteria));
    }

    // =========================================================================
    // PUBLIC VOTER ENDPOINTS
    // =========================================================================

    @GetMapping("/api/voter/categories")
    public ResponseEntity<ApiResponse<List<VoterCategoryResponse>>> getVoterCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long eventId
    ) {
        List<VoterCategoryResponse> list = categoryService.getCategoriesForVoter(search, eventId);
        return ResponseEntity.ok(ApiResponse.success("Active award categories retrieved successfully", list));
    }

    @GetMapping("/api/voter/categories/{id}")
    public ResponseEntity<ApiResponse<VoterCategoryResponse>> getVoterCategoryDetails(@PathVariable Long id) {
        VoterCategoryResponse details = categoryService.getCategoryForVoter(id);
        return ResponseEntity.ok(ApiResponse.success("Category details for voting retrieved successfully", details));
    }

    // =========================================================================
    // SYSTEM ADMINISTRATOR MONITORING ENDPOINTS
    // =========================================================================

    @GetMapping("/api/admin/categories")
    public ResponseEntity<ApiResponse<Page<AdminCategoryResponse>>> getAdminCategories(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) CategoryStatus status,
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
        Page<AdminCategoryResponse> pageResult = categoryService.getCategoriesForAdmin(search, status, eventId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Admin category audit list retrieved successfully", pageResult));
    }

    @GetMapping("/api/admin/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDetailsResponse>> getAdminCategoryDetails(@PathVariable Long id) {
        CategoryDetailsResponse details = categoryService.getCategoryForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Admin category inspection retrieved successfully", details));
    }
}
