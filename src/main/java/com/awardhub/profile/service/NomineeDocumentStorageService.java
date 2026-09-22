package com.awardhub.profile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Handles the actual reading/writing of uploaded document files on disk.
 * Kept separate from NomineeDocumentService so the storage mechanism (local
 * disk here) can be swapped for cloud storage later without touching the
 * business logic.
 */
@Service
public class NomineeDocumentStorageService {

    @Value("${app.upload.nominee-documents-dir:uploads/nominee-documents}")
    private String uploadDir;

    // Keep this list in sync with what the frontend accepts.
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    /**
     * Validates and stores the file. Returns the randomized name it was stored under.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds the 10MB size limit");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Uploaded file has no name");
        }
        // Basic path-traversal guard.
        String cleanedName = Paths.get(originalName).getFileName().toString();
        String extension = getExtension(cleanedName);

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
            Path target = dir.resolve(storedFileName).normalize();

            if (!target.getParent().equals(dir)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file: " + e.getMessage(), e);
        }
    }

    public Path resolve(String storedFileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(storedFileName).normalize();
    }

    public void delete(String storedFileName) {
        try {
            Files.deleteIfExists(resolve(storedFileName));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete stored file: " + e.getMessage(), e);
        }
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return (dot == -1 || dot == fileName.length() - 1) ? "" : fileName.substring(dot + 1).toLowerCase();
    }
}
