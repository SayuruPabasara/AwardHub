package com.awardhub.reports.repository;

import com.awardhub.common.enums.ReportType;
import com.awardhub.reports.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportType(ReportType reportType);
    List<Report> findByCategoryId(Long categoryId);
    List<Report> findByArchived(Boolean archived);
}