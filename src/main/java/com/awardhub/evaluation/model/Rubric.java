package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * A versioned set of scoring criteria used for one category.
 * Rubrics are versioned rather than edited in place: scores submitted under version 1
 * stay meaningful even if the organizer publishes version 2.
 */
@Entity
@Table(name = "rubric")
public class Rubric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private int version = 1;

    @Column(name = "scale_min", nullable = false)
    private int scaleMin = 1;

    @Column(name = "scale_max", nullable = false)
    private int scaleMax = 10;

    /** Only one rubric per category may be active at a time. */
    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    @OrderBy("displayOrder ASC")
    private List<RubricCriterion> criteria = new ArrayList<>();

    public void addCriterion(RubricCriterion c) {
        c.setRubric(this);
        this.criteria.add(c);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public int getScaleMin() { return scaleMin; }
    public void setScaleMin(int scaleMin) { this.scaleMin = scaleMin; }
    public int getScaleMax() { return scaleMax; }
    public void setScaleMax(int scaleMax) { this.scaleMax = scaleMax; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<RubricCriterion> getCriteria() { return criteria; }
    public void setCriteria(List<RubricCriterion> criteria) { this.criteria = criteria; }
}
