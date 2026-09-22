package com.awardhub.profile.dto;

import com.awardhub.profile.entity.DocumentVerificationStatus;
import com.awardhub.profile.entity.NomineeDocument;
import com.awardhub.profile.entity.NomineeDocumentType;

import java.time.LocalDateTime;

public class NomineeDocumentResponse {

    private Long documentId;
    private NomineeDocumentType documentType;
    private String originalFileName;
    private String fileFormat;
    private Long size;
    private LocalDateTime uploadDate;
    private DocumentVerificationStatus verificationStatus;

    public NomineeDocumentResponse() {}

    public static NomineeDocumentResponse fromEntity(NomineeDocument doc) {
        NomineeDocumentResponse dto = new NomineeDocumentResponse();
        dto.setDocumentId(doc.getDocumentId());
        dto.setDocumentType(doc.getDocumentType());
        dto.setOriginalFileName(doc.getOriginalFileName());
        dto.setFileFormat(doc.getFileFormat());
        dto.setSize(doc.getSize());
        dto.setUploadDate(doc.getUploadDate());
        dto.setVerificationStatus(doc.getVerificationStatus());
        return dto;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public NomineeDocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(NomineeDocumentType documentType) {
        this.documentType = documentType;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public DocumentVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(DocumentVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
