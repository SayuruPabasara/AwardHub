package com.awardhub.profile.repository;

import com.awardhub.profile.entity.NomineeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NomineeDocumentRepository extends JpaRepository<NomineeDocument, Long> {

    List<NomineeDocument> findByNominee_Id(Long nomineeId);

    Optional<NomineeDocument> findByDocumentIdAndNominee_Id(Long documentId, Long nomineeId);

    Optional<NomineeDocument> findByStoredFileName(String storedFileName);
}
