package com.awardhub.category.repository;

import com.awardhub.category.entity.CategoryCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryCriterionRepository extends JpaRepository<CategoryCriterion, Long> {
    List<CategoryCriterion> findByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
