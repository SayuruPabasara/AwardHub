package com.awardhub.profile.controller;

import com.awardhub.common.dto.ApiResponse;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.profile.dto.NomineeDocumentResponse;
import com.awardhub.profile.entity.NomineeDocument;
import com.awardhub.profile.entity.NomineeDocumentType;
import com.awardhub.profile.service.NomineeDocumentService;
import com.awardhub.user.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/profile/nominee/me/documents")
public class NomineeDocumentController {

    private final NomineeDocumentService documentService;

    public NomineeDocumentController(NomineeDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NomineeDocumentResponse>> uploadDocument(
            @RequestParam("documentType") NomineeDocumentType documentType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        NomineeDocumentResponse response = documentService.upload(user.getUserID(), documentType, file);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<List<NomineeDocumentResponse>>> listMyDocuments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.success(documentService.listForNominee(user.getUserID())));
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal User user
    ) {
        NomineeDocument document = documentService.getOwnedDocument(user.getUserID(), documentId);
        Path filePath = documentService.resolveFilePath(document);

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Stored file is missing for document ID: " + documentId);
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + document.getOriginalFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Could not read stored file for document ID: " + documentId);
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal User user
    ) {
        documentService.delete(user.getUserID(), documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
