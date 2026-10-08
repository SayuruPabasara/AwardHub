package com.awardhub.category.dto;

import com.awardhub.common.enums.CategoryStatus;
import jakarta.validation.constraints.NotNull;

public class CategoryStatusUpdateRequest {

    @NotNull(message = "Category status is required")
    private CategoryStatus status;

    public CategoryStatusUpdateRequest() {}

    public CategoryStatusUpdateRequest(CategoryStatus status) {
        this.status = status;
    }

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status;
    }
}
