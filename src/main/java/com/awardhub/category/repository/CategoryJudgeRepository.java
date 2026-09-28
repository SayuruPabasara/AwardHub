package com.awardhub.category.repository;

import com.awardhub.category.entity.Category;
import com.awardhub.category.entity.CategoryJudge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryJudgeRepository extends JpaRepository<CategoryJudge, Long> {

    List<CategoryJudge> findByCategoryId(Long categoryId);

    List<CategoryJudge> findByJudgeId(Long judgeId);

    boolean existsByCategoryIdAndJudgeId(Long categoryId, Long judgeId);

    Optional<CategoryJudge> findByCategoryIdAndJudgeId(Long categoryId, Long judgeId);

    void deleteByCategoryIdAndJudgeId(Long categoryId, Long judgeId);

    void deleteByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);

    @Query("SELECT cj.category FROM CategoryJudge cj WHERE cj.judge.id = :judgeId")
    List<Category> findCategoriesByJudgeId(@Param("judgeId") Long judgeId);

    @Query("SELECT cj.category FROM CategoryJudge cj WHERE cj.judge.id = :judgeId AND LOWER(cj.category.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Category> findCategoriesByJudgeIdAndSearch(@Param("judgeId") Long judgeId, @Param("search") String search);

    @Query("SELECT cj.category FROM CategoryJudge cj WHERE cj.judge.email = :judgeEmail")
    List<Category> findCategoriesByJudgeEmail(@Param("judgeEmail") String judgeEmail);
}
