package com.awardhub.profile.service;

import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.profile.dto.NomineeDocumentResponse;
import com.awardhub.profile.entity.NomineeDocument;
import com.awardhub.profile.entity.NomineeDocumentType;
import com.awardhub.profile.repository.NomineeDocumentRepository;
import com.awardhub.profile.repository.NomineeProfileRepository;
import com.awardhub.user.entity.Nominee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class NomineeDocumentService {

    private final NomineeDocumentRepository documentRepository;
    private final NomineeProfileRepository nomineeRepository;
    private final NomineeDocumentStorageService storageService;
    private final AuditLogService auditLogService;

    public NomineeDocumentService(NomineeDocumentRepository documentRepository,
                                   NomineeProfileRepository nomineeRepository,
                                   NomineeDocumentStorageService storageService,
                                   AuditLogService auditLogService) {
        this.documentRepository = documentRepository;
        this.nomineeRepository = nomineeRepository;
        this.storageService = storageService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public NomineeDocumentResponse upload(Long nomineeId, NomineeDocumentType documentType, MultipartFile file) {
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee profile not found for ID: " + nomineeId));

        if (documentType == null) {
            throw new IllegalArgumentException("documentType is required");
        }

        String storedFileName = storageService.store(file);

        NomineeDocument document = NomineeDocument.builder()
                .nominee(nominee)
                .documentType(documentType)
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedFileName)
                .fileFormat(getExtension(file.getOriginalFilename()))
                .size(file.getSize())
                .build();

        NomineeDocument saved = documentRepository.save(document);

        auditLogService.log(nomineeId, "UPLOAD_DOCUMENT", "NomineeDocument", saved.getDocumentId(),
                "Uploaded " + documentType + " document: " + document.getOriginalFileName());

        return NomineeDocumentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<NomineeDocumentResponse> listForNominee(Long nomineeId) {
        return documentRepository.findByNominee_Id(nomineeId).stream()
                .map(NomineeDocumentResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public NomineeDocument getOwnedDocument(Long nomineeId, Long documentId) {
        NomineeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found for ID: " + documentId));
        if (!document.getNominee().getId().equals(nomineeId)) {
            throw new UnauthorizedActionException("You do not have access to this document");
        }
        return document;
    }

    @Transactional
    public void delete(Long nomineeId, Long documentId) {
        NomineeDocument document = getOwnedDocument(nomineeId, documentId);
        storageService.delete(document.getStoredFileName());
        documentRepository.delete(document);
        auditLogService.log(nomineeId, "DELETE_DOCUMENT", "NomineeDocument", documentId,
                "Deleted document: " + document.getOriginalFileName());
    }

    public java.nio.file.Path resolveFilePath(NomineeDocument document) {
        return storageService.resolve(document.getStoredFileName());
    }

    private String getExtension(String fileName) {
        if (fileName == null) return null;
        int dot = fileName.lastIndexOf('.');
        return (dot == -1 || dot == fileName.length() - 1) ? null : fileName.substring(dot + 1).toLowerCase();
    }
}
