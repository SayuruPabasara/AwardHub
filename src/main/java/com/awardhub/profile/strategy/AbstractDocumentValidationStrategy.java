package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Shared plumbing for the concrete strategies: each subclass only declares
 * WHICH types it handles, WHICH extensions it accepts and HOW LARGE a file
 * may be. The checking steps themselves live here once, so the concrete
 * strategies stay tiny and do not repeat code.
 */
public abstract class AbstractDocumentValidationStrategy implements DocumentValidationStrategy {

    private final Set<NomineeDocumentType> supportedTypes;
    private final Set<String> allowedExtensions;
    private final long maxSizeBytes;
    private final String description;

    protected AbstractDocumentValidationStrategy(Set<NomineeDocumentType> supportedTypes,
                                                 Set<String> allowedExtensions,
                                                 long maxSizeBytes,
                                                 String description) {
        this.supportedTypes = supportedTypes;
        this.allowedExtensions = allowedExtensions;
        this.maxSizeBytes = maxSizeBytes;
        this.description = description;
    }

    @Override
    public Set<NomineeDocumentType> supportedTypes() {
        return supportedTypes;
    }

    @Override
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String extension = extensionOf(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException(
                    description + " must be one of: " + allowedExtensions.stream().sorted().collect(Collectors.joining(", ")));
        }

        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    description + " must not exceed " + (maxSizeBytes / (1024 * 1024)) + "MB");
        }
    }

    private static String extensionOf(String fileName) {
        if (fileName == null) return "";
        int dot = fileName.lastIndexOf('.');
        return (dot == -1 || dot == fileName.length() - 1)
                ? ""
                : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
