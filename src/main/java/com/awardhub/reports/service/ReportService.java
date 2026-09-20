package com.awardhub.reports.service;

import com.awardhub.common.enums.ReportType;
import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.reports.dto.ReportRequestDTO;
import com.awardhub.reports.dto.ReportResponseDTO;
import com.awardhub.reports.entity.Report;
import com.awardhub.reports.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public ReportResponseDTO generate(ReportRequestDTO dto) {
        Report report = new Report();
        report.setReportType(dto.getReportType());
        report.setCategoryId(dto.getCategoryId());
        report.setContent(dto.getContent() != null ? dto.getContent() : "[auto-generated]");
        report.setGeneratedBy(dto.getGeneratedBy());
        report.setFormat(dto.getFormat());
        report.setArchived(false);
        return toDTO(reportRepository.save(report));
    }

    public List<ReportResponseDTO> getAll() {
        return reportRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ReportResponseDTO> getByType(ReportType type) {
        return reportRepository.findByReportType(type).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ReportResponseDTO> getForRole(Role role) {
        switch (role) {
            case ADMIN:
            case ORGANIZER:
                return getAll();
            case JUDGE:
                return getByType(ReportType.EVALUATION);
            case VOTER:
                return getByType(ReportType.VOTING);
            case NOMINEE:
                return getByType(ReportType.NOMINATION);
            default:
                return List.of();
        }
    }

    public ReportResponseDTO archive(Long id) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        r.setArchived(true);
        return toDTO(reportRepository.save(r));
    }

    public void delete(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Report not found");
        }
        reportRepository.deleteById(id);
    }

    private ReportResponseDTO toDTO(Report r) {
        ReportResponseDTO dto = new ReportResponseDTO();
        dto.setId(r.getId());
        dto.setReportType(r.getReportType());
        dto.setCategoryId(r.getCategoryId());
        dto.setContent(r.getContent());
        dto.setGeneratedBy(r.getGeneratedBy());
        dto.setFormat(r.getFormat());
        dto.setArchived(r.getArchived());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}