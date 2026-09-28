package com.awardhub.category.repository;

import com.awardhub.category.entity.Category;
import com.awardhub.common.enums.CategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByAwardEventIdAndName(Long awardEventId, String name);

    boolean existsByAwardEventIdAndNameAndIdNot(Long awardEventId, String name, Long id);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.criteria WHERE c.id = :id")
    Optional<Category> findByIdWithCriteria(@Param("id") Long id);

    @Query("SELECT c FROM Category c WHERE " +
           "(:awardEventId IS NULL OR c.awardEventId = :awardEventId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:includeArchived = TRUE OR c.status <> 'ARCHIVED') AND " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Category> findCategories(
            @Param("awardEventId") Long awardEventId,
            @Param("status") CategoryStatus status,
            @Param("includeArchived") boolean includeArchived,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(CategoryStatus status);

    List<Category> findByAwardEventId(Long awardEventId);
}
