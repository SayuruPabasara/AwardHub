-- =============================================================================
-- AwardHub: Comprehensive Demonstration Seed Data Script
-- Target Database: awardhub2 (Microsoft SQL Server)
-- Purpose: Populates all modules with realistic data covering every status,
--          role, document type, evaluation mode, report type, and workflow variation
--          for University Evaluation and Live Demonstrations.
-- Default Credentials: password123 (for all users)
-- Password Hash: $2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS
-- =============================================================================
--
-- QUICK LOGIN CHEATSHEET FOR EVALUATORS:
-- +--------------------------+-----------------------+-----------------------+----------------------+
-- | Role                     | Username              | Password              | Account Status       |
-- +--------------------------+-----------------------+-----------------------+----------------------+
-- | System Administrator     | admin                 | password123           | ACTIVE               |
-- | Head Organizer           | head_organizer        | password123           | ACTIVE               |
-- | Award Organizer (Lead)   | organizer_lead        | password123           | ACTIVE               |
-- | Organizing Team Member   | organizer_member      | password123           | ACTIVE               |
-- | IT Coordinator           | it_coordinator        | password123           | ACTIVE               |
-- | Compliance / Auditor     | auditor_james         | password123           | ACTIVE               |
-- | Judge (Chief Judge)      | dr_miller             | password123           | ACTIVE               |
-- | Judge (Cloud / Infra)    | prof_elena            | password123           | ACTIVE               |
-- | Judge (AI Specialist)    | judge_rajesh          | password123           | ACTIVE               |
-- | Judge (Ethics / Recused) | judge_sophia          | password123           | ACTIVE               |
-- | Nominee (AI Winner)      | nominee_alex          | password123           | ACTIVE               |
-- | Nominee (Green Tech)     | nominee_clara         | password123           | ACTIVE               |
-- | Nominee (Draft In-Prog)  | nominee_marcus        | password123           | ACTIVE               |
-- | Nominee (Submitted)      | nominee_aisha         | password123           | ACTIVE               |
-- | Nominee (Under Review)   | nominee_devon         | password123           | ACTIVE               |
-- | Nominee (Pending ID)     | nominee_pending       | password123           | PENDING_VERIFICATION |
-- | Voter 1 (Active)         | voter_sarah           | password123           | ACTIVE               |
-- | Voter 2 (Active)         | voter_david           | password123           | ACTIVE               |
-- | Voter 3 (Active)         | voter_emma            | password123           | ACTIVE               |
-- | Voter 4 (Active)         | voter_liam            | password123           | ACTIVE               |
-- | Voter 5 (Suspended)      | voter_suspended       | password123           | SUSPENDED            |
-- | Voter 6 (Deactivated)    | user_deactivated      | password123           | DEACTIVATED          |
-- +--------------------------+-----------------------+-----------------------+----------------------+
--
-- VARIATIONS REPRESENTED ACROSS ALL MODULES:
-- 1. User Roles: ADMIN, HEAD_ORGANIZER, ORGANIZER, ORGANIZING_TEAM_MEMBER, IT_COORDINATOR,
--                AUDIT, JUDGE, NOMINEE, VOTER (All 9 enum values)
-- 2. Account Statuses: ACTIVE, PENDING_VERIFICATION, SUSPENDED, DEACTIVATED (All 4 enum values)
-- 3. Category Statuses: DRAFT, ACTIVE, VOTING_OPEN, VOTING_CLOSED, ARCHIVED (All 5 enum values)
-- 4. Nomination Statuses: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED (All 5 enum values)
-- 5. Nominee Document Types: NIC_PASSPORT_COPY, CV, CERTIFICATE, ACHIEVEMENT_PROOF, PROFILE_PHOTO, OTHER (All 6)
-- 6. Document Verification Statuses: VERIFIED, PENDING, REJECTED (All 3 enum values)
-- 7. Evaluation Modes: HYBRID, JUDGE_ONLY, PUBLIC_ONLY (All 3 enum values)
-- 8. Aggregation Methods: MEAN, TRIMMED_MEAN, MEDIAN (All 3 enum values)
-- 9. Vote Normalization: MAX_IN_CATEGORY, SHARE_OF_TOTAL (Both enum values)
-- 10. Judge Assignment Statuses: ASSIGNED, IN_PROGRESS, COMPLETED, REVOKED (All 4 enum values)
-- 11. Evaluation Statuses: DRAFT, SUBMITTED, VERIFIED, LOCKED (All 4 enum values)
-- 12. Result Set Statuses: DRAFT, CALCULATED, PENDING_APPROVAL, PUBLISHED (All 4 enum values)
-- 13. Feedback Types: PRAISE, SUGGESTION, BUG, COMPLAINT (All 4 enum values)
-- 14. Feedback Statuses: OPEN, IN_PROGRESS, RESOLVED, CLOSED (All 4 enum values)
-- 15. Report Types: NOMINATION, VOTING, EVALUATION, WINNER, TIE, PARTICIPATION (All 6 enum values)
-- 16. Report Formats: PDF, CSV, EXCEL (All 3 enum values)
-- =============================================================================

USE awardhub2;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Compatibility guard: convert legacy TEXT columns to VARCHAR(MAX) if needed
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'categories' AND COLUMN_NAME = 'description' AND DATA_TYPE = 'text')
BEGIN
    ALTER TABLE categories ALTER COLUMN description VARCHAR(MAX) NOT NULL;
    ALTER TABLE categories ALTER COLUMN rules VARCHAR(MAX) NULL;
    ALTER TABLE categories ALTER COLUMN nominee_eligibility VARCHAR(MAX) NULL;
    ALTER TABLE categories ALTER COLUMN voter_eligibility VARCHAR(MAX) NULL;
    ALTER TABLE categories ALTER COLUMN nomination_requirements VARCHAR(MAX) NULL;
END
GO
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'nominations' AND COLUMN_NAME = 'description' AND DATA_TYPE = 'text')
BEGIN
    ALTER TABLE nominations ALTER COLUMN description VARCHAR(MAX) NOT NULL;
    ALTER TABLE nominations ALTER COLUMN rejection_reason VARCHAR(MAX) NULL;
END
GO

-- =============================================================================
-- 1. CLEANUP (Reverse dependency order to cleanly avoid FK violations)
-- =============================================================================
DELETE FROM criterion_score;
DELETE FROM evaluation;
DELETE FROM rubric_criterion;
DELETE FROM rubric;
DELETE FROM result_entry;
DELETE FROM result_set;
DELETE FROM evaluation_scheme;
DELETE FROM judge_assignment;
DELETE FROM category_judges;
DELETE FROM votes;
DELETE FROM category_criteria;
DELETE FROM nominee_documents;
DELETE FROM feedback_reply;
DELETE FROM feedback;
DELETE FROM report;
DELETE FROM analytics_snapshot;
DELETE FROM evaluation_audit_log;
DELETE FROM audit_logs;
DELETE FROM nominations;
DELETE FROM categories;
DELETE FROM nominees;
DELETE FROM users;
GO

-- =============================================================================
-- 2. USERS (All 9 Roles & All 4 Account Statuses represented)
-- Password for all seed users is 'password123'
-- BCrypt Hash: $2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS
-- =============================================================================
SET IDENTITY_INSERT users ON;

INSERT INTO users (
    id, user_type, username, email, password, role, full_name, active,
    contact_number, registration_date, account_status, nic, bio,
    location, website, avatar, notif_email, notif_sms, notif_results, last_login
) VALUES
-- ID 1: System Admin (ACTIVE)
(1, 'User', 'admin', 'admin@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'ADMIN', 'System Administrator', 1,
 '+1-555-0100', DATEADD(DAY, -60, SYSDATETIME()), 'ACTIVE', 'NIC-ADM-001', 'Chief System Administrator for AwardHub platform infrastructure and security.',
 'San Francisco, CA', 'https://awardhub.org', 'AD', 1, 0, 1, SYSDATETIME()),

-- ID 2: Lead Organizer (ACTIVE)
(2, 'User', 'organizer_lead', 'organizer@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'ORGANIZER', 'Elena Rostova', 1,
 '+1-555-0101', DATEADD(DAY, -50, SYSDATETIME()), 'ACTIVE', 'NIC-ORG-002', 'Head of Annual Global Tech & Innovation Awards and Category Coordinator.',
 'Boston, MA', 'https://techawards.global', 'ER', 1, 1, 1, SYSDATETIME()),

-- ID 3: Chief Judge (ACTIVE)
(3, 'User', 'dr_miller', 'judge.miller@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Dr. Marcus Miller', 1,
 '+1-555-0102', DATEADD(DAY, -45, SYSDATETIME()), 'ACTIVE', 'NIC-JDG-003', 'Professor of Computer Science & AI Ethics at MIT.',
 'Cambridge, MA', 'https://mit.edu/mmiller', 'MM', 1, 0, 1, SYSDATETIME()),

-- ID 4: Cloud Judge (ACTIVE)
(4, 'User', 'prof_elena', 'judge.elena@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Prof. Elena Vance', 1,
 '+1-555-0103', DATEADD(DAY, -45, SYSDATETIME()), 'ACTIVE', 'NIC-JDG-004', 'Senior Cloud Solutions Architect & IEEE Fellow.',
 'Seattle, WA', 'https://ieee.org/evance', 'EV', 1, 0, 1, SYSDATETIME()),

-- ID 5: Nominee 1 - Active Winner (ACTIVE)
(5, 'NOMINEE', 'nominee_alex', 'nominee.alex@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Alex Rivera', 1,
 '+1-555-0104', DATEADD(DAY, -40, SYSDATETIME()), 'ACTIVE', 'NIC-NOM-005', 'Founder & Chief Architect at NeuralFlow AI.',
 'Austin, TX', 'https://neuralflow.io', 'AR', 1, 0, 1, SYSDATETIME()),

-- ID 6: Nominee 2 - Active Runner Up (ACTIVE)
(6, 'NOMINEE', 'nominee_clara', 'nominee.clara@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Clara Oswald', 1,
 '+1-555-0105', DATEADD(DAY, -40, SYSDATETIME()), 'ACTIVE', 'NIC-NOM-006', 'VP of Engineering at EcoGreen Energy Systems.',
 'Portland, OR', 'https://ecogreen.org', 'CO', 1, 0, 1, SYSDATETIME()),

-- ID 7: Verified Public Voter 1 (ACTIVE)
(7, 'User', 'voter_sarah', 'sarah.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Sarah Jenkins', 1,
 '+1-555-0106', DATEADD(DAY, -35, SYSDATETIME()), 'ACTIVE', 'NIC-VOT-007', 'Independent Software Engineer & Open Source Contributor.',
 'Chicago, IL', 'https://sarahjenkins.dev', 'SJ', 1, 0, 1, SYSDATETIME()),

-- ID 8: Verified Public Voter 2 (ACTIVE)
(8, 'User', 'voter_david', 'david.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'David Kim', 1,
 '+1-555-0107', DATEADD(DAY, -35, SYSDATETIME()), 'ACTIVE', 'NIC-VOT-008', 'Data Analyst & Sustainable Tech Advocate.',
 'San Jose, CA', '', 'DK', 1, 0, 1, SYSDATETIME()),

-- ID 9: Head Organizer (ACTIVE)
(9, 'User', 'head_organizer', 'head.organizer@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'HEAD_ORGANIZER', 'Prof. Arthur Pendelton', 1,
 '+1-555-0109', DATEADD(DAY, -55, SYSDATETIME()), 'ACTIVE', 'NIC-HOR-009', 'Chair of the Global Award Committee and Academic Dean.',
 'New York, NY', 'https://awardhub.org/committee', 'AP', 1, 1, 1, SYSDATETIME()),

-- ID 10: Organizing Team Member (ACTIVE)
(10, 'User', 'organizer_member', 'sofia.team@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'ORGANIZING_TEAM_MEMBER', 'Sofia Chen', 1,
 '+1-555-0110', DATEADD(DAY, -45, SYSDATETIME()), 'ACTIVE', 'NIC-OTM-010', 'Award Operations Specialist & Nominee Liaison Officer.',
 'Toronto, ON', '', 'SC', 1, 0, 1, SYSDATETIME()),

-- ID 11: IT Coordinator (ACTIVE)
(11, 'User', 'it_coordinator', 'it.coordinator@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'IT_COORDINATOR', 'Liam O''Connor', 1,
 '+1-555-0111', DATEADD(DAY, -50, SYSDATETIME()), 'ACTIVE', 'NIC-ITC-011', 'Lead Infrastructure Engineer and IT Security Coordinator.',
 'Dublin, Ireland', 'https://awardhub.org/it', 'LO', 1, 1, 1, SYSDATETIME()),

-- ID 12: Compliance Auditor (ACTIVE)
(12, 'User', 'auditor_james', 'audit.sterling@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'AUDIT', 'James Sterling', 1,
 '+1-555-0112', DATEADD(DAY, -50, SYSDATETIME()), 'ACTIVE', 'NIC-AUD-012', 'Independent Senior Quality & Evaluation Integrity Auditor.',
 'London, UK', 'https://auditcouncil.org', 'JS', 1, 0, 1, SYSDATETIME()),

-- ID 13: Judge 3 - AI Specialist (ACTIVE)
(13, 'User', 'judge_rajesh', 'rajesh.judge@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Dr. Rajesh Patel', 1,
 '+1-555-0113', DATEADD(DAY, -40, SYSDATETIME()), 'ACTIVE', 'NIC-JDG-013', 'Principal AI Researcher at CyberCore Labs.',
 'Bangalore, India', 'https://cybercore.ai', 'RP', 1, 0, 1, SYSDATETIME()),

-- ID 14: Judge 4 - Ethics & Social Impact (ACTIVE)
(14, 'User', 'judge_sophia', 'sophia.judge@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Dr. Sophia Lindqvist', 1,
 '+1-555-0114', DATEADD(DAY, -40, SYSDATETIME()), 'ACTIVE', 'NIC-JDG-014', 'Associate Professor in Human-Centered AI and Digital Ethics.',
 'Stockholm, Sweden', 'https://kth.se/lindqvist', 'SL', 1, 0, 1, SYSDATETIME()),

-- ID 15: Nominee 3 - Quantum Computing (ACTIVE)
(15, 'NOMINEE', 'nominee_marcus', 'marcus.nominee@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Marcus Vance', 1,
 '+1-555-0115', DATEADD(DAY, -25, SYSDATETIME()), 'ACTIVE', 'NIC-NOM-015', 'CTO & Co-founder at QuantumLeap Software.',
 'Boulder, CO', 'https://quantumleap.dev', 'MV', 1, 0, 1, SYSDATETIME()),

-- ID 16: Nominee 4 - Clean Water Telemetry (ACTIVE)
(16, 'NOMINEE', 'nominee_aisha', 'aisha.nominee@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Aisha Diallo', 1,
 '+1-555-0116', DATEADD(DAY, -20, SYSDATETIME()), 'ACTIVE', 'NIC-NOM-016', 'Founder of HydroTech Clean Water & IoT Sensor Mesh.',
 'Dakar, Senegal', 'https://hydrotech-iot.org', 'AD', 1, 0, 1, SYSDATETIME()),

-- ID 17: Nominee 5 - Accessibility Tech (ACTIVE)
(17, 'NOMINEE', 'nominee_devon', 'devon.nominee@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Devon Thorne', 1,
 '+1-555-0117', DATEADD(DAY, -18, SYSDATETIME()), 'ACTIVE', 'NIC-NOM-017', 'Lead Accessibility Architect at VisionBraille Labs.',
 'Atlanta, GA', 'https://visionbraille.org', 'DT', 1, 0, 1, SYSDATETIME()),

-- ID 18: Nominee 6 - Pending Identity Verification (PENDING_VERIFICATION)
(18, 'NOMINEE', 'nominee_pending', 'carlos.pending@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Carlos Mendez', 1,
 '+1-555-0118', DATEADD(DAY, -2, SYSDATETIME()), 'PENDING_VERIFICATION', 'NIC-NOM-018', 'BioTech researcher applying for health innovation award.',
 'Miami, FL', 'https://mendezlabs.org', 'CM', 1, 0, 0, NULL),

-- ID 19: Verified Public Voter 3 (ACTIVE)
(19, 'User', 'voter_emma', 'emma.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Emma Watson-Lee', 1,
 '+1-555-0119', DATEADD(DAY, -30, SYSDATETIME()), 'ACTIVE', 'NIC-VOT-019', 'Community organizer and open-web advocate.',
 'Seattle, WA', '', 'EW', 1, 0, 1, SYSDATETIME()),

-- ID 20: Verified Public Voter 4 (ACTIVE)
(20, 'User', 'voter_liam', 'liam.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Liam Tanaka', 1,
 '+1-555-0120', DATEADD(DAY, -28, SYSDATETIME()), 'ACTIVE', 'NIC-VOT-020', 'Graduate Student in Information Systems.',
 'Austin, TX', '', 'LT', 1, 0, 1, SYSDATETIME()),

-- ID 21: Suspended User (SUSPENDED - e.g. Flagged for voting anomaly / duplicate ballot)
(21, 'User', 'voter_suspended', 'flagged.user@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Flagged Test Voter', 0,
 '+1-555-0121', DATEADD(DAY, -15, SYSDATETIME()), 'SUSPENDED', 'NIC-VOT-021', 'Account temporarily suspended pending investigation of suspicious ballot bursts.',
 'Phoenix, AZ', '', 'FS', 0, 0, 0, DATEADD(DAY, -5, SYSDATETIME())),

-- ID 22: Deactivated User (DEACTIVATED - Voluntary closure)
(22, 'User', 'user_deactivated', 'deactivated@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Robert Deactivated', 0,
 '+1-555-0122', DATEADD(DAY, -90, SYSDATETIME()), 'DEACTIVATED', 'NIC-VOT-022', 'Account voluntarily closed by user.',
 'Denver, CO', '', 'RD', 0, 0, 0, DATEADD(DAY, -60, SYSDATETIME()));

SET IDENTITY_INSERT users OFF;
GO

-- =============================================================================
-- 3. NOMINEES EXTENDED PROFILES (Joined Inheritance Table)
-- =============================================================================
INSERT INTO nominees (
    id, nic_passport, date_of_birth, gender,
    street, city, state, zip,
    organization, job_title, biography,
    education, achievements, nominee_references
) VALUES
-- ID 5: Alex Rivera
(5, 'NIC-NOM-005', '1988-04-12', 'Non-Binary',
 '450 Innovation Way', 'Austin', 'TX', '78701',
 'NeuralFlow AI', 'Chief Architect & Founder',
 'Pioneering edge-device micro-transformer architectures enabling on-device sub-millisecond LLM inference without cloud dependencies.',
 'Ph.D. in Computer Science (Stanford); B.S. in Applied Mathematics (UC Berkeley)',
 '8 NeurIPS publications; Recipient of 2024 AI Pioneer Award; Named to Forbes 30 Under 30',
 'Dr. Marcus Miller (MIT), Dr. Susan Lee (Stanford AI Lab)'),

-- ID 6: Clara Oswald
(6, 'NIC-NOM-006', '1991-09-24', 'Female',
 '820 Green Valley Blvd', 'Portland', 'OR', '97201',
 'EcoGreen Energy Systems', 'VP of Engineering',
 'Specializing in smart-grid telemetry, municipal microgrid balancing algorithms, and reducing thermal stresses on green battery arrays.',
 'M.S. in Electrical & Computer Engineering (Carnegie Mellon); B.S. in Environmental Systems (UW)',
 '3 US patents granted for adaptive battery balancing microgrids; CleanTech 40 Under 40 Honoree',
 'Elena Vance (IEEE Fellow), Peter Capaldi (Glasgow Clean Energy Foundation)'),

-- ID 15: Marcus Vance
(15, 'NIC-NOM-015', '1985-11-03', 'Male',
 '120 Quantum Ridge Rd', 'Boulder', 'CO', '80302',
 'QuantumLeap Software', 'Chief Technology Officer',
 'Researching noise-resilient quantum algorithms and cloud-accessible quantum compiler toolchains for materials discovery.',
 'Ph.D. in Quantum Information Theory (Caltech); B.S. in Physics (MIT)',
 'Principal investigator on NSF Quantum Leap grant; Author of "Modern Quantum Computing Pipelines"',
 'Prof. John Preskill (Caltech), Dr. Evelyn Reed (IBM Quantum)'),

-- ID 16: Aisha Diallo
(16, 'NIC-NOM-016', '1993-02-18', 'Female',
 '74 Corniche Ouest', 'Dakar', 'Senegal', '10200',
 'HydroTech Clean Water Initiative', 'Executive Director & Lead Engineer',
 'Designing solar-powered ultrafiltration telemetry stations that monitor remote village drinking aquifers with real-time SMS alerts.',
 'M.S. in Civil & Water Resource Engineering (Imperial College London); B.S. in Mechatronics (UCAD)',
 'United Nations Young Champions of the Earth Regional Finalist; Deployed in 42 municipal districts',
 'Dr. Aminata Traore (WaterAid), Dr. David Robinson (Global Water Institute)'),

-- ID 17: Devon Thorne
(17, 'NIC-NOM-017', '1990-07-30', 'Male',
 '310 Tech Park Dr', 'Atlanta', 'GA', '30308',
 'VisionBraille Labs', 'Head of Inclusive Engineering',
 'Developing low-cost electro-tactile refreshable braille displays and screenless spatial audio navigation for visually impaired scholars.',
 'M.S. in Human-Computer Interaction (Georgia Tech); B.S. in Biomedical Engineering',
 'Apple Design Award for Accessibility; W3C Silver Level Contributor to WCAG 3.0 Working Group',
 'Prof. Gregory Abowd (Northeastern), Sarah Jenkins (Open Source Accessibility Working Group)'),

-- ID 18: Carlos Mendez (Pending)
(18, 'NIC-NOM-018', '1995-12-14', 'Male',
 '55 Ocean Drive', 'Miami', 'FL', '33139',
 'Mendez BioLabs', 'Founder & Lead Researcher',
 'Applying generative diffusion models to small-molecule enzyme engineering for plastic depolymerization.',
 'B.S. in Computational Biology (University of Florida)',
 'Young Researcher Grant recipient 2025',
 'Dr. Ricardo Gomez (Scripps Research Institute)');
GO

-- =============================================================================
-- 4. NOMINEE DOCUMENTS (All 6 Document Types & All 3 Verification Statuses)
-- =============================================================================
SET IDENTITY_INSERT nominee_documents ON;

INSERT INTO nominee_documents (
    document_id, nominee_id, document_type, original_file_name,
    stored_file_name, file_format, size, upload_date, verification_status
) VALUES
-- Alex Rivera: Complete set of VERIFIED documents
(1, 5, 'NIC_PASSPORT_COPY', 'Alex_Rivera_Passport_Scan.pdf', 'doc_5_passport_a89f21.pdf', 'pdf', 1542000, DATEADD(DAY, -38, SYSDATETIME()), 'VERIFIED'),
(2, 5, 'CV', 'Alex_Rivera_Curriculum_Vitae_2025.pdf', 'doc_5_cv_b33c14.pdf', 'pdf', 840000, DATEADD(DAY, -38, SYSDATETIME()), 'VERIFIED'),
(3, 5, 'CERTIFICATE', 'Stanford_PhD_Degree_Certificate.pdf', 'doc_5_cert_e91b55.pdf', 'pdf', 2100000, DATEADD(DAY, -37, SYSDATETIME()), 'VERIFIED'),
(4, 5, 'ACHIEVEMENT_PROOF', 'NeurIPS_Best_Paper_Award_2024.pdf', 'doc_5_proof_c44d78.pdf', 'pdf', 3120000, DATEADD(DAY, -37, SYSDATETIME()), 'VERIFIED'),
(5, 5, 'PROFILE_PHOTO', 'Alex_Rivera_Headshot_HighRes.png', 'doc_5_avatar_d77e90.png', 'png', 4500000, DATEADD(DAY, -37, SYSDATETIME()), 'VERIFIED'),

-- Clara Oswald: VERIFIED documents
(6, 6, 'NIC_PASSPORT_COPY', 'Clara_Oswald_ID_Card.pdf', 'doc_6_nic_f12a34.pdf', 'pdf', 1230000, DATEADD(DAY, -35, SYSDATETIME()), 'VERIFIED'),
(7, 6, 'CV', 'Clara_Oswald_Engineering_CV.pdf', 'doc_6_cv_a99e82.pdf', 'pdf', 920000, DATEADD(DAY, -35, SYSDATETIME()), 'VERIFIED'),
(8, 6, 'ACHIEVEMENT_PROOF', 'US_Patent_Battery_Balancing.pdf', 'doc_6_patent_55cf21.pdf', 'pdf', 4890000, DATEADD(DAY, -34, SYSDATETIME()), 'VERIFIED'),

-- Marcus Vance: PENDING verification documents
(9, 15, 'NIC_PASSPORT_COPY', 'Marcus_Vance_Govt_Passport.pdf', 'doc_15_passport_99ad01.pdf', 'pdf', 1850000, DATEADD(DAY, -5, SYSDATETIME()), 'PENDING'),
(10, 15, 'CV', 'Marcus_Vance_Executive_CV.pdf', 'doc_15_cv_88fe22.pdf', 'pdf', 740000, DATEADD(DAY, -5, SYSDATETIME()), 'PENDING'),

-- Aisha Diallo: VERIFIED and OTHER type
(11, 16, 'NIC_PASSPORT_COPY', 'Aisha_Diallo_Passport.pdf', 'doc_16_passport_33ea11.pdf', 'pdf', 1400000, DATEADD(DAY, -19, SYSDATETIME()), 'VERIFIED'),
(12, 16, 'OTHER', 'Senegal_Ministry_Water_Endorsement.pdf', 'doc_16_other_77aa44.pdf', 'pdf', 2800000, DATEADD(DAY, -19, SYSDATETIME()), 'VERIFIED'),

-- Carlos Mendez: REJECTED document (Blurry image demonstration)
(13, 18, 'NIC_PASSPORT_COPY', 'Carlos_ID_Blurry_Photo.jpg', 'doc_18_id_blur_66cc99.jpg', 'jpg', 420000, DATEADD(DAY, -2, SYSDATETIME()), 'REJECTED'),
(14, 18, 'CV', 'Carlos_Mendez_Bio_Draft.docx', 'doc_18_cv_draft_22ee11.docx', 'docx', 310000, DATEADD(DAY, -2, SYSDATETIME()), 'PENDING');

SET IDENTITY_INSERT nominee_documents OFF;
GO

-- =============================================================================
-- 5. CATEGORIES (All 5 Category Statuses: ACTIVE, VOTING_CLOSED, VOTING_OPEN, DRAFT, ARCHIVED)
-- =============================================================================
SET IDENTITY_INSERT categories ON;

INSERT INTO categories (
    id, award_event_id, name, description, rules,
    nominee_eligibility, voter_eligibility, nomination_requirements,
    nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date,
    status, created_at, updated_at, archived_at, created_by
) VALUES
-- ID 1: Excellence in AI Innovation (Status: ACTIVE - Under evaluation & hybrid scoring)
(1, 1, 'Excellence in AI Innovation',
 'Honoring breakthrough artificial intelligence solutions that deliver transformative, verified real-world impact.',
 'Submissions must include a live demonstration link, verifiable benchmark metrics, and an ethical governance compliance statement.',
 'Open to individual engineers, university researchers, and registered artificial intelligence startups.',
 'Any registered voter with an active, verified account in good standing may cast one ballot.',
 'Technical whitepaper or architecture deck and verifiable public source repository.',
 DATEADD(DAY, -45, SYSDATETIME()), DATEADD(DAY, -20, SYSDATETIME()),
 DATEADD(DAY, -19, SYSDATETIME()), DATEADD(DAY, -2, SYSDATETIME()),
 DATEADD(DAY, 5, SYSDATETIME()),
 'ACTIVE', DATEADD(DAY, -45, SYSDATETIME()), SYSDATETIME(), NULL, 'organizer_lead'),

-- ID 2: Sustainability & Green Computing (Status: VOTING_CLOSED - Official Results Published)
(2, 1, 'Sustainability & Green Computing',
 'Recognizing sustainable software architectures, low-carbon computing systems, and renewable telemetry platforms.',
 'Candidate systems must provide verifiable telemetry proving at least 25% energy reduction or verified carbon offset.',
 'Open to global software teams, DevOps engineers, and corporate sustainability departments.',
 'Verified AwardHub voters.',
 'Verified energy consumption audit report and production telemetry summary.',
 DATEADD(DAY, -50, SYSDATETIME()), DATEADD(DAY, -25, SYSDATETIME()),
 DATEADD(DAY, -24, SYSDATETIME()), DATEADD(DAY, -7, SYSDATETIME()),
 DATEADD(DAY, -5, SYSDATETIME()),
 'VOTING_CLOSED', DATEADD(DAY, -50, SYSDATETIME()), SYSDATETIME(), NULL, 'organizer_lead'),

-- ID 3: Outstanding Cloud Architecture (Status: ACTIVE - Judge Only evaluation)
(3, 1, 'Outstanding Cloud Architecture',
 'Celebrating zero-downtime, multi-region resilient cloud topologies and enterprise Kubernetes platform engineering.',
 'Designs must demonstrate active-active failover capabilities, SLO compliance, and zero data-loss disaster recovery.',
 'DevOps architects, SRE teams, and platform engineering organizations.',
 'Judges panel only (Closed to public voting).',
 'Cloud topology architecture diagram, SLO audit report, and disaster recovery chaos test results.',
 DATEADD(DAY, -40, SYSDATETIME()), DATEADD(DAY, -15, SYSDATETIME()),
 DATEADD(DAY, -14, SYSDATETIME()), DATEADD(DAY, 7, SYSDATETIME()),
 DATEADD(DAY, 10, SYSDATETIME()),
 'ACTIVE', DATEADD(DAY, -40, SYSDATETIME()), SYSDATETIME(), NULL, 'organizer_lead'),

-- ID 4: Community Tech & Digital Inclusion (Status: VOTING_OPEN - Live public voting underway!)
(4, 1, 'Community Tech & Digital Inclusion',
 'Celebrating open-source grassroots initiatives, assistive digital accessibility tools, and inclusive civic tech.',
 'Submissions must be free and open-source or widely accessible to low-income and underserved communities.',
 'Civic technologists, non-profit software teams, and accessibility pioneers.',
 'All verified public voters. One vote per verified citizen NIC.',
 'Project demo URL, community impact metrics summary, and accessibility compliance audit.',
 DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME()),
 DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, 10, SYSDATETIME()),
 DATEADD(DAY, 12, SYSDATETIME()),
 'VOTING_OPEN', DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME(), NULL, 'organizer_lead'),

-- ID 5: Quantum & Frontier Computing Award (Status: DRAFT - Upcoming cycle being formulated)
(5, 1, 'Quantum & Frontier Computing Award',
 'Recognizing groundbreaking early-stage prototypes in quantum algorithm synthesis, photonic chips, and neuromorphic computing.',
 'Proposals must demonstrate mathematical proofs and simulated or actual QPU execution logs.',
 'Academic researchers, quantum physicists, and frontier deep-tech labs.',
 'To be finalized by the Award Committee.',
 'Formal research paper draft and quantum circuit simulation Jupyter notebook.',
 DATEADD(DAY, 15, SYSDATETIME()), DATEADD(DAY, 45, SYSDATETIME()),
 DATEADD(DAY, 46, SYSDATETIME()), DATEADD(DAY, 75, SYSDATETIME()),
 DATEADD(DAY, 80, SYSDATETIME()),
 'DRAFT', SYSDATETIME(), SYSDATETIME(), NULL, 'organizer_lead'),

-- ID 6: Legacy Enterprise Software 2024 (Status: ARCHIVED - Historical past award)
(6, 1, 'Legacy Enterprise Software 2024',
 'Historical category honoring legacy mainframe modernization and monolithic refactoring architectures.',
 'Completed projects delivered in calendar year 2024.',
 'Enterprise modernization teams.',
 'Archived voter registry.',
 'Final architecture audit.',
 DATEADD(DAY, -365, SYSDATETIME()), DATEADD(DAY, -330, SYSDATETIME()),
 DATEADD(DAY, -329, SYSDATETIME()), DATEADD(DAY, -300, SYSDATETIME()),
 DATEADD(DAY, -295, SYSDATETIME()),
 'ARCHIVED', DATEADD(DAY, -365, SYSDATETIME()), DATEADD(DAY, -290, SYSDATETIME()), DATEADD(DAY, -290, SYSDATETIME()), 'organizer_lead');

SET IDENTITY_INSERT categories OFF;
GO

-- =============================================================================
-- 6. CATEGORY CRITERIA
-- =============================================================================
SET IDENTITY_INSERT category_criteria ON;

INSERT INTO category_criteria (id, category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
-- Category 1: AI Innovation (Weights sum to 1.00)
(1, 1, 'Algorithmic Novelty', 'Originality of the neural network architecture and optimization math.', 0.40, 10, SYSDATETIME(), SYSDATETIME()),
(2, 1, 'Real-World Latency & Scale', 'Measured edge latency, throughput benchmarks, and resource frugality.', 0.35, 10, SYSDATETIME(), SYSDATETIME()),
(3, 1, 'Ethical Guardrails', 'Fairness metrics, transparency, bias mitigation, and data privacy safeguards.', 0.25, 10, SYSDATETIME(), SYSDATETIME()),

-- Category 2: Green Computing (Weights sum to 1.00)
(4, 2, 'Energy Reduction Magnitude', 'Quantified kilowatt-hour reduction per transaction against legacy benchmarks.', 0.50, 10, SYSDATETIME(), SYSDATETIME()),
(5, 2, 'Adoption Feasibility', 'Ease of deployment across existing municipal and cloud infrastructure.', 0.50, 10, SYSDATETIME(), SYSDATETIME()),

-- Category 3: Cloud Architecture (Weights sum to 1.00)
(6, 3, 'Resilience & RTO/RPO', 'Chaos resilience under region partition and recovery time objective.', 0.50, 10, SYSDATETIME(), SYSDATETIME()),
(7, 3, 'Cost-Efficiency per QPS', 'Infrastructure cost normalized per million queries served.', 0.50, 10, SYSDATETIME(), SYSDATETIME()),

-- Category 4: Digital Inclusion (Weights sum to 1.00)
(8, 4, 'Accessibility Compliance (WCAG)', 'Full compliance with WCAG 2.2 AAA accessibility requirements.', 0.40, 10, SYSDATETIME(), SYSDATETIME()),
(9, 4, 'Community Reach & Adoption', 'Number of active users in underserved rural or marginalized areas.', 0.35, 10, SYSDATETIME(), SYSDATETIME()),
(10, 4, 'Open Source Sustainability', 'Code maintainability, documentation quality, and community governance.', 0.25, 10, SYSDATETIME(), SYSDATETIME());

SET IDENTITY_INSERT category_criteria OFF;
GO

-- =============================================================================
-- 7. CATEGORY JUDGES & EVALUATION ASSIGNMENTS (All 4 Assignment Statuses)
-- =============================================================================
SET IDENTITY_INSERT category_judges ON;

INSERT INTO category_judges (id, category_id, judge_id, assigned_at, assigned_by) VALUES
(1, 1, 3, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(2, 1, 4, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(3, 1, 13, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(4, 1, 14, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(5, 2, 3, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(6, 2, 4, DATEADD(DAY, -30, SYSDATETIME()), 'organizer_lead'),
(7, 3, 4, DATEADD(DAY, -20, SYSDATETIME()), 'organizer_lead'),
(8, 3, 13, DATEADD(DAY, -20, SYSDATETIME()), 'organizer_lead'),
(9, 4, 14, DATEADD(DAY, -10, SYSDATETIME()), 'organizer_lead');

SET IDENTITY_INSERT category_judges OFF;
GO

SET IDENTITY_INSERT judge_assignment ON;

INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at, conflict_note) VALUES
-- COMPLETED: Dr. Marcus Miller finished scoring Category 1 & Category 2
(1, 1, 3, 'Dr. Marcus Miller', 'COMPLETED', DATEADD(DAY, -30, SYSDATETIME()), NULL),
(2, 2, 3, 'Dr. Marcus Miller', 'COMPLETED', DATEADD(DAY, -30, SYSDATETIME()), NULL),

-- IN_PROGRESS: Prof. Elena Vance has submitted some scores and drafted others
(3, 1, 4, 'Prof. Elena Vance', 'IN_PROGRESS', DATEADD(DAY, -30, SYSDATETIME()), NULL),
(4, 3, 4, 'Prof. Elena Vance', 'IN_PROGRESS', DATEADD(DAY, -20, SYSDATETIME()), NULL),

-- ASSIGNED: Dr. Rajesh Patel newly assigned, awaiting evaluations
(5, 1, 13, 'Dr. Rajesh Patel', 'ASSIGNED', DATEADD(DAY, -15, SYSDATETIME()), NULL),
(6, 3, 13, 'Dr. Rajesh Patel', 'ASSIGNED', DATEADD(DAY, -15, SYSDATETIME()), NULL),

-- REVOKED: Dr. Sophia Lindqvist recused due to conflict of interest
(7, 1, 14, 'Dr. Sophia Lindqvist', 'REVOKED', DATEADD(DAY, -28, SYSDATETIME()), 'Recused due to co-authoring a 2023 paper with nominee Alex Rivera.'),

-- ASSIGNED: Dr. Sophia Lindqvist actively assigned to Digital Inclusion
(8, 4, 14, 'Dr. Sophia Lindqvist', 'ASSIGNED', DATEADD(DAY, -10, SYSDATETIME()), NULL);

SET IDENTITY_INSERT judge_assignment OFF;
GO

-- =============================================================================
-- 8. EVALUATION SCHEMES (All Modes: HYBRID, JUDGE_ONLY, PUBLIC_ONLY; Aggregations: MEAN, TRIMMED_MEAN, MEDIAN)
-- =============================================================================
SET IDENTITY_INSERT evaluation_scheme ON;

INSERT INTO evaluation_scheme (
    id, category_id, category_name, mode,
    judge_weight, public_weight, aggregation_method,
    vote_normalization, min_judges_required, blind_review, locked,
    evaluation_opens_at, evaluation_closes_at
) VALUES
-- Category 1: HYBRID (70% Judge / 30% Public), MEAN aggregation, MAX_IN_CATEGORY normalization
(1, 1, 'Excellence in AI Innovation', 'HYBRID',
 0.7000, 0.3000, 'MEAN', 'MAX_IN_CATEGORY', 2, 1, 1,
 DATEADD(DAY, -20, SYSDATETIME()), DATEADD(DAY, 4, SYSDATETIME())),

-- Category 2: HYBRID (60% Judge / 40% Public), TRIMMED_MEAN aggregation, SHARE_OF_TOTAL normalization
(2, 2, 'Sustainability & Green Computing', 'HYBRID',
 0.6000, 0.4000, 'TRIMMED_MEAN', 'SHARE_OF_TOTAL', 1, 0, 1,
 DATEADD(DAY, -25, SYSDATETIME()), DATEADD(DAY, -6, SYSDATETIME())),

-- Category 3: JUDGE_ONLY (100% Judge / 0% Public), MEDIAN aggregation
(3, 3, 'Outstanding Cloud Architecture', 'JUDGE_ONLY',
 1.0000, 0.0000, 'MEDIAN', 'MAX_IN_CATEGORY', 1, 1, 0,
 DATEADD(DAY, -14, SYSDATETIME()), DATEADD(DAY, 7, SYSDATETIME())),

-- Category 4: PUBLIC_ONLY (0% Judge / 100% Public)
(4, 4, 'Community Tech & Digital Inclusion', 'PUBLIC_ONLY',
 0.0000, 1.0000, 'MEAN', 'MAX_IN_CATEGORY', 1, 0, 0,
 DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, 10, SYSDATETIME())),

-- Category 5: HYBRID in DRAFT mode
(5, 5, 'Quantum & Frontier Computing Award', 'HYBRID',
 0.8000, 0.2000, 'MEAN', 'MAX_IN_CATEGORY', 2, 1, 0,
 DATEADD(DAY, 45, SYSDATETIME()), DATEADD(DAY, 75, SYSDATETIME()));

SET IDENTITY_INSERT evaluation_scheme OFF;
GO

-- =============================================================================
-- 9. RUBRICS & RUBRIC CRITERIA
-- =============================================================================
SET IDENTITY_INSERT rubric ON;

INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES
(1, 1, 'AI Evaluation Matrix v1', 1, 1, 10, 1),
(2, 2, 'Green Metrics Scoring Matrix v1', 1, 1, 10, 1),
(3, 3, 'Cloud Resilience Matrix v1', 1, 1, 10, 1),
(4, 4, 'Digital Accessibility Scoring Rubric v1', 1, 1, 10, 1),
(5, 1, 'AI Evaluation Matrix v2 (Draft Revision)', 2, 1, 10, 0); -- Inactive version 2 rubric

SET IDENTITY_INSERT rubric OFF;
GO

SET IDENTITY_INSERT rubric_criterion ON;

INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES
-- Rubric 1: AI Evaluation Matrix v1
(1, 1, 'Algorithmic Novelty', 'Mathematical originality and model compression innovation.', 0.4000, 1),
(2, 1, 'Production Deployment & Reliability', 'Execution stability, SLA fulfillment, and measured edge latency.', 0.3500, 2),
(3, 1, 'Responsible AI & Transparency', 'Fairness auditing, explainability, and bias safeguard protocols.', 0.2500, 3),

-- Rubric 2: Green Metrics Scoring Matrix v1
(4, 2, 'Carbon & Energy Reduction', 'Direct reduction in power consumption (watt-hours per request).', 0.5000, 1),
(5, 2, 'Circular Lifecycle & Reusability', 'Hardware lifespan extension and open telemetry adoption.', 0.5000, 2),

-- Rubric 3: Cloud Resilience Matrix v1
(6, 3, 'Chaos Resilience & Recovery', 'Automated failover recovery within strict RTO bounds.', 0.5000, 1),
(7, 3, 'Cloud Cost & Resource Efficiency', 'Cost optimization per billion transactions executed.', 0.5000, 2),

-- Rubric 4: Digital Accessibility Scoring Rubric v1
(8, 4, 'WCAG 2.2 AAA Implementation', 'Screen reader fidelity, color contrast, and keyboard navigation.', 0.4000, 1),
(9, 4, 'Grassroots Community Impact', 'Empirical adoption rate among underserved populations.', 0.3500, 2),
(10, 4, 'Maintainability & Open Governance', 'Community pull-request responsiveness and documentation clarity.', 0.2500, 3);

SET IDENTITY_INSERT rubric_criterion OFF;
GO

-- =============================================================================
-- 10. NOMINATIONS (All 5 Nomination Statuses: APPROVED, SUBMITTED, UNDER_REVIEW, DRAFT, REJECTED)
-- =============================================================================
SET IDENTITY_INSERT nominations ON;

INSERT INTO nominations (
    id, category_id, nominee_id, title, description,
    supporting_document, status, rejection_reason, reviewed_by, reviewed_at,
    created_at, updated_at
) VALUES
-- ID 1: APPROVED - AI Innovation Winner
(1, 1, 5, 'NeuralFlow: Low-Latency Edge LLM Inference Engine',
 'NeuralFlow compresses multi-billion-parameter foundation models to run on battery-constrained microcontrollers with sub-10ms response times.',
 'https://neuralflow.io/whitepaper-2025.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -21, SYSDATETIME()),
 DATEADD(DAY, -25, SYSDATETIME()), SYSDATETIME()),

-- ID 2: APPROVED - AI Innovation Runner Up
(2, 1, 6, 'EcoVision: AI-Powered Wildfire Prevention Sensor Mesh',
 'An autonomous computer-vision edge network deployed in high-risk nature reserves that detects early canopy smoke signatures within 30 seconds.',
 'https://ecogreen.org/reports/ecovision-early-smoke.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -21, SYSDATETIME()),
 DATEADD(DAY, -24, SYSDATETIME()), SYSDATETIME()),

-- ID 3: APPROVED - Green Computing Winner
(3, 2, 6, 'ZeroGrid: Adaptive Microgrid Battery Balancing Controller',
 'Distributed firmware orchestration eliminating peak-hour thermal stress and extending lithium storage lifespans on municipal microgrids.',
 'https://ecogreen.org/zerogrid-whitepaper.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -26, SYSDATETIME()),
 DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME()),

-- ID 4: APPROVED - Green Computing Runner Up
(4, 2, 5, 'CarbonZero: Dynamic Server Power Modulation Platform',
 'Kubernetes scheduler scheduler extension that shifts non-urgent batch workloads to cloud regions operating on 100% surplus solar and wind power.',
 'https://neuralflow.io/carbonzero.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -26, SYSDATETIME()),
 DATEADD(DAY, -29, SYSDATETIME()), SYSDATETIME()),

-- ID 5: APPROVED - Cloud Architecture Entry
(5, 3, 5, 'OmniMesh: Global Multi-Cloud Active-Active Service Mesh',
 'Peer-to-peer federated service mesh enabling seamless failover across AWS, Azure, and Google Cloud with sub-millisecond route synchronization.',
 'https://neuralflow.io/omnimesh-architecture.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -16, SYSDATETIME()),
 DATEADD(DAY, -20, SYSDATETIME()), SYSDATETIME()),

-- ID 6: SUBMITTED - Clean Water Telemetry (Awaiting Organizer Initial Screening)
(6, 4, 16, 'HydroPulse: Solar-Powered Rural Water Telemetry',
 'Low-cost optical and acoustic sensor pods installed on rural borehole pumps that transmit water quality and aquifer depletion data via LoRaWAN.',
 'https://hydrotech-iot.org/hydropulse-specs.pdf', 'SUBMITTED', NULL, NULL, NULL,
 DATEADD(DAY, -6, SYSDATETIME()), SYSDATETIME()),

-- ID 7: UNDER_REVIEW - Assistive Tech (Organizer Sofia currently reviewing documents)
(7, 4, 17, 'VisionBraille: Electro-Tactile Refreshable Haptic Display',
 'Affordable 40-cell dynamic braille display connecting to any phone via WebBluetooth, reducing the cost of assistive reading technology by 85%.',
 'https://visionbraille.org/haptic-display-eval.pdf', 'UNDER_REVIEW', NULL, 10, DATEADD(DAY, -1, SYSDATETIME()),
 DATEADD(DAY, -5, SYSDATETIME()), SYSDATETIME()),

-- ID 8: APPROVED - Digital Inclusion Entry in Live Voting Category
(8, 4, 17, 'BrailleCode: Open-Source Accessible Programming IDE',
 'Screen-reader optimized code editor with real-time auditory syntax linting and tactile flow visualizations for blind software developers.',
 'https://visionbraille.org/braillecode-demo.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -4, SYSDATETIME()),
 DATEADD(DAY, -10, SYSDATETIME()), SYSDATETIME()),

-- ID 9: APPROVED - Digital Inclusion Second Entry in Live Voting Category
(9, 4, 16, 'AquaVoice: Multilingual Water Scarcity Alert Hotline',
 'Interactive voice response service that delivers clean water point schedules and boil-water advisories in 12 regional languages.',
 'https://hydrotech-iot.org/aquavoice-impact.pdf', 'APPROVED', NULL, 2, DATEADD(DAY, -4, SYSDATETIME()),
 DATEADD(DAY, -9, SYSDATETIME()), SYSDATETIME()),

-- ID 10: DRAFT - Nominee Marcus working on submission draft (Not submitted yet)
(10, 5, 15, 'QuantumNoise: Error Mitigation Toolkit for NISQ Processors',
 'Zero-noise extrapolation and probabilistic error cancellation algorithms implemented as an open-source Python compiler pass.',
 'https://quantumleap.dev/drafts/quantum-noise.pdf', 'DRAFT', NULL, NULL, NULL,
 DATEADD(DAY, -1, SYSDATETIME()), SYSDATETIME()),

-- ID 11: REJECTED - Disqualified for policy violation / unverified claims
(11, 1, 18, 'CryptoPredict: Autonomous Speculative High-Frequency Trading Bot',
 'Deep reinforcement learning agent designed to front-run decentralized exchange liquidity pools for speculative crypto gains.',
 'https://mendezlabs.org/cryptopredict.pdf', 'REJECTED', 'Submission violates Ethical AI guidelines: strictly commercial high-frequency speculation without verifiable public benefit.', 2, DATEADD(DAY, -18, SYSDATETIME()),
 DATEADD(DAY, -22, SYSDATETIME()), SYSDATETIME());

SET IDENTITY_INSERT nominations OFF;
GO

-- =============================================================================
-- 11. PUBLIC VOTES (Respecting unique constraints uk_vote_voter_category & uk_vote_nic_category)
-- =============================================================================
SET IDENTITY_INSERT votes ON;

INSERT INTO votes (id, category_id, nomination_id, voter_id, nic, casted_at) VALUES
-- Category 1: AI Innovation (Voters 7 & 8)
(1, 1, 1, 7, 'NIC-VOT-007', DATEADD(DAY, -10, SYSDATETIME())),
(2, 1, 2, 8, 'NIC-VOT-008', DATEADD(DAY, -8, SYSDATETIME())),

-- Category 2: Green Computing (Voters 7, 8, 19, 20)
(3, 2, 3, 7, 'NIC-VOT-007', DATEADD(DAY, -12, SYSDATETIME())),
(4, 2, 3, 8, 'NIC-VOT-008', DATEADD(DAY, -11, SYSDATETIME())),
(5, 2, 3, 19, 'NIC-VOT-019', DATEADD(DAY, -10, SYSDATETIME())),
(6, 2, 4, 20, 'NIC-VOT-020', DATEADD(DAY, -9, SYSDATETIME())),

-- Category 4: Digital Inclusion (Live voting currently ongoing!)
(7, 4, 8, 7, 'NIC-VOT-007', DATEADD(HOUR, -18, SYSDATETIME())),
(8, 4, 8, 8, 'NIC-VOT-008', DATEADD(HOUR, -12, SYSDATETIME())),
(9, 4, 9, 19, 'NIC-VOT-019', DATEADD(HOUR, -6, SYSDATETIME())),
(10, 4, 8, 20, 'NIC-VOT-020', DATEADD(HOUR, -2, SYSDATETIME()));

SET IDENTITY_INSERT votes OFF;
GO

-- =============================================================================
-- 12. JUDGE EVALUATIONS & SCORES (All Evaluation Statuses: SUBMITTED, VERIFIED, DRAFT, LOCKED)
-- =============================================================================
SET IDENTITY_INSERT evaluation ON;

INSERT INTO evaluation (
    id, nomination_id, category_id, judge_id, rubric_id,
    status, total_score, comments, submitted_at, updated_at
) VALUES
-- Evaluation 1: Dr. Marcus Miller on Nomination 1 (SUBMITTED)
(1, 1, 1, 3, 1, 'SUBMITTED', 92.5000,
 'Exceptional mathematical rigor in the quantization kernels. Low-latency edge performance confirmed on microcontrollers.',
 DATEADD(DAY, -12, SYSDATETIME()), SYSDATETIME()),

-- Evaluation 2: Dr. Marcus Miller on Nomination 2 (SUBMITTED)
(2, 2, 1, 3, 1, 'SUBMITTED', 87.0000,
 'Impressive field deployment metrics and very strong environmental relevance in wildlife protection.',
 DATEADD(DAY, -11, SYSDATETIME()), SYSDATETIME()),

-- Evaluation 3: Prof. Elena Vance on Nomination 1 (VERIFIED - Confirmed by organizer)
(3, 1, 1, 4, 1, 'VERIFIED', 94.0000,
 'Flawless edge execution and reproducible open-source benchmark suites. Outstanding engineering.',
 DATEADD(DAY, -10, SYSDATETIME()), SYSDATETIME()),

-- Evaluation 4: Prof. Elena Vance on Nomination 5 (DRAFT - Score entered, review in-progress)
(4, 5, 3, 4, 3, 'DRAFT', 88.5000,
 'Preliminary assessment: multi-cloud active-active routing is solid. Verifying latency SLA graphs.',
 NULL, SYSDATETIME()),

-- Evaluation 5: Dr. Marcus Miller on Nomination 3 (LOCKED - Past cycle sealed evaluation)
(5, 3, 2, 3, 2, 'LOCKED', 95.0000,
 'Transformative municipal power savings. Patent-backed safety controls for high-voltage battery arrays.',
 DATEADD(DAY, -15, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME())),

-- Evaluation 6: Dr. Marcus Miller on Nomination 4 (LOCKED - Past cycle sealed evaluation)
(6, 4, 2, 3, 2, 'LOCKED', 88.0000,
 'Clean Kubernetes scheduler implementation. Dynamic cloud workload shifting verified in simulation.',
 DATEADD(DAY, -15, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME()));

SET IDENTITY_INSERT evaluation OFF;
GO

SET IDENTITY_INSERT criterion_score ON;

INSERT INTO criterion_score (id, evaluation_id, criterion_id, raw_score, note) VALUES
-- Scores for Evaluation 1 (Dr. Miller on Nomination 1)
(1, 1, 1, 9.50, 'Novel quantization kernel algorithm.'),
(2, 1, 2, 9.00, 'Demonstrated across 10,000 low-power edge nodes.'),
(3, 1, 3, 9.20, 'Clear transparency guidelines and reproducible benchmarks.'),

-- Scores for Evaluation 2 (Dr. Miller on Nomination 2)
(4, 2, 1, 8.50, 'Standard CNN model customized for low-light smoke signatures.'),
(5, 2, 2, 9.20, 'Zero false negatives observed in pilot test trials.'),
(6, 2, 3, 8.20, 'Good data privacy documentation for outdoor nature cameras.'),

-- Scores for Evaluation 3 (Prof. Vance on Nomination 1)
(7, 3, 1, 9.60, 'Cutting-edge quantization math. Exceeds standard LLM inference baselines.'),
(8, 3, 2, 9.50, 'Sub-10ms confirmed on ARM Cortex-M55.'),
(9, 3, 3, 9.00, 'Robust ethics declaration and bias mitigation measures.'),

-- Scores for Evaluation 4 (Prof. Vance on Nomination 5 - Draft)
(10, 4, 6, 9.00, 'Zero downtime failover validated under simulated network partition.'),
(11, 4, 7, 8.70, 'Substantial AWS to GCP egress cost savings documented.'),

-- Scores for Evaluation 5 (Dr. Miller on Nomination 3 - Green Computing)
(12, 5, 4, 9.60, 'Direct 32% thermal stress reduction verified on municipal grid.'),
(13, 5, 5, 9.40, 'Ready for immediate plug-and-play retrofit across commercial battery packs.'),

-- Scores for Evaluation 6 (Dr. Miller on Nomination 4 - Green Computing)
(14, 6, 4, 8.90, 'Shifts 1.2 megawatts of daily compute to green renewable windows.'),
(15, 6, 5, 8.70, 'Relies on standard Kubernetes API admission webhooks.');

SET IDENTITY_INSERT criterion_score OFF;
GO

-- =============================================================================
-- 13. RESULT SETS & RANKINGS (All Result Statuses: PUBLISHED, CALCULATED, PENDING_APPROVAL, DRAFT)
-- =============================================================================
SET IDENTITY_INSERT result_set ON;

INSERT INTO result_set (
    id, category_id, status, mode_snapshot,
    judge_weight_snapshot, public_weight_snapshot,
    calculated_at, published_at, published_by,
    recalculation_reason, version_no
) VALUES
-- ID 1: PUBLISHED - Category 1 (AI Innovation official winners leaderboard)
(1, 1, 'PUBLISHED', 'HYBRID', 0.7000, 0.3000,
 DATEADD(HOUR, -6, SYSDATETIME()), DATEADD(HOUR, -5, SYSDATETIME()), 2,
 NULL, 1),

-- ID 2: PUBLISHED - Category 2 (Sustainability & Green Computing)
(2, 2, 'PUBLISHED', 'HYBRID', 0.6000, 0.4000,
 DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -4, SYSDATETIME()), 2,
 NULL, 1),

-- ID 3: CALCULATED - Category 3 (Automated scoring engine completed, waiting for organizer review)
(3, 3, 'CALCULATED', 'JUDGE_ONLY', 1.0000, 0.0000,
 DATEADD(HOUR, -2, SYSDATETIME()), NULL, NULL,
 NULL, 1),

-- ID 4: PENDING_APPROVAL - Category 4 (Digital Inclusion preliminary standings submitted to Head Organizer)
(4, 4, 'PENDING_APPROVAL', 'PUBLIC_ONLY', 0.0000, 1.0000,
 DATEADD(HOUR, -1, SYSDATETIME()), NULL, NULL,
 'Preliminary tally certified by Vote System; awaiting Head Organizer sign-off.', 1),

-- ID 5: DRAFT - Category 5 (Draft result set placeholder)
(5, 5, 'DRAFT', 'HYBRID', 0.8000, 0.2000,
 NULL, NULL, NULL,
 NULL, 1);

SET IDENTITY_INSERT result_set OFF;
GO

SET IDENTITY_INSERT result_entry ON;

INSERT INTO result_entry (
    id, result_set_id, nomination_id, nominee_name,
    judge_score, judges_counted, vote_count, vote_score,
    final_score, rank_position, winner, tie_break_note, excluded_reason
) VALUES
-- Category 1 (Result Set 1 - Published Leaderboard)
-- Winner: Alex Rivera (Rank 1, Winner = 1)
(1, 1, 1, 'Alex Rivera (NeuralFlow: Low-Latency Edge LLM)',
 93.2500, 2, 1, 100.0000, 95.2750, 1, 1, 'Clear winner on weighted hybrid score', NULL),

-- Runner Up: Clara Oswald (Rank 2, Winner = 0)
(2, 1, 2, 'Clara Oswald (EcoVision: AI-Powered Wildfire Prevention)',
 87.0000, 1, 1, 100.0000, 90.9000, 2, 0, NULL, NULL),

-- Category 2 (Result Set 2 - Published Leaderboard)
-- Winner: Clara Oswald (ZeroGrid)
(3, 2, 3, 'Clara Oswald (ZeroGrid: Adaptive Battery Balancing)',
 95.0000, 1, 3, 75.0000, 87.0000, 1, 1, 'Unanimous lead across judge metrics and majority public vote share', NULL),

-- Runner Up: Alex Rivera (CarbonZero)
(4, 2, 4, 'Alex Rivera (CarbonZero: Dynamic Server Power Modulation)',
 88.0000, 1, 1, 25.0000, 62.8000, 2, 0, NULL, NULL),

-- Category 3 (Result Set 3 - CALCULATED Result)
-- Entry with tie break demonstration
(5, 3, 5, 'Alex Rivera (OmniMesh: Global Multi-Cloud Active-Active)',
 88.5000, 1, 0, 0.0000, 88.5000, 1, 1, 'Ranked #1 by single judge consensus', NULL),

-- Category 4 (Result Set 4 - PENDING_APPROVAL Result with Tie / Exclusion example)
(6, 4, 8, 'Devon Thorne (BrailleCode: Open-Source Accessible IDE)',
 0.0000, 0, 3, 75.0000, 75.0000, 1, 1, 'Leading public vote tally (3 verified citizen votes)', NULL),

(7, 4, 9, 'Aisha Diallo (AquaVoice: Multilingual Water Scarcity Alert)',
 0.0000, 0, 1, 25.0000, 25.0000, 2, 0, NULL, NULL);

SET IDENTITY_INSERT result_entry OFF;
GO

-- =============================================================================
-- 14. AUDIT TRAILS & LOGS (All administrative, operational & evaluation actions)
-- =============================================================================
SET IDENTITY_INSERT audit_logs ON;

INSERT INTO audit_logs (logid, performed_by_user_id, action_type, entity_type, entity_id, details, timestamp) VALUES
(1, 1, 'USER_CREATED', 'User', 2, 'Created Organizer account for Elena Rostova', DATEADD(DAY, -50, SYSDATETIME())),
(2, 1, 'USER_CREATED', 'User', 9, 'Created Head Organizer account for Prof. Arthur Pendelton', DATEADD(DAY, -50, SYSDATETIME())),
(3, 1, 'USER_CREATED', 'User', 11, 'Created IT Coordinator account for Liam O''Connor', DATEADD(DAY, -50, SYSDATETIME())),
(4, 1, 'USER_CREATED', 'User', 12, 'Created Auditor account for James Sterling', DATEADD(DAY, -50, SYSDATETIME())),
(5, 2, 'CATEGORY_CREATED', 'Category', 1, 'Formulated category: Excellence in AI Innovation', DATEADD(DAY, -45, SYSDATETIME())),
(6, 2, 'CATEGORY_STATUS_UPDATED', 'Category', 1, 'Transitioned status from DRAFT to ACTIVE', DATEADD(DAY, -44, SYSDATETIME())),
(7, 2, 'CATEGORY_STATUS_UPDATED', 'Category', 4, 'Transitioned status to VOTING_OPEN for public ballots', DATEADD(DAY, -4, SYSDATETIME())),
(8, 2, 'NOMINATION_APPROVED', 'Nomination', 1, 'Approved NeuralFlow nomination following technical screening', DATEADD(DAY, -21, SYSDATETIME())),
(9, 2, 'NOMINATION_APPROVED', 'Nomination', 2, 'Approved EcoVision wildfire sensor mesh submission', DATEADD(DAY, -21, SYSDATETIME())),
(10, 2, 'NOMINATION_REJECTED', 'Nomination', 11, 'Rejected CryptoPredict: Failed ethical AI standards and guidelines', DATEADD(DAY, -18, SYSDATETIME())),
(11, 10, 'DOCUMENT_VERIFIED', 'NomineeDocument', 1, 'Sofia Chen verified Passport scan for Alex Rivera', DATEADD(DAY, -37, SYSDATETIME())),
(12, 10, 'DOCUMENT_REJECTED', 'NomineeDocument', 13, 'Rejected illegible ID scan for Carlos Mendez; notified user', DATEADD(DAY, -2, SYSDATETIME())),
(13, 1, 'USER_SUSPENDED', 'User', 21, 'Suspended account voter_suspended after duplicate automated vote attempt was blocked', DATEADD(DAY, -5, SYSDATETIME())),
(14, 2, 'RESULTS_PUBLISHED', 'ResultSet', 1, 'Official certified results published to public leaderboard', DATEADD(HOUR, -5, SYSDATETIME())),
(15, 2, 'RESULTS_PUBLISHED', 'ResultSet', 2, 'Certified winner published for Sustainability & Green Computing', DATEADD(DAY, -4, SYSDATETIME()));

SET IDENTITY_INSERT audit_logs OFF;
GO

SET IDENTITY_INSERT evaluation_audit_log ON;

INSERT INTO evaluation_audit_log (id, actor_id, action, entity_type, entity_id, detail, occurred_at) VALUES
(1, 2, 'SCHEME_CONFIGURED', 'EvaluationScheme', 1, 'Configured HYBRID mode with 0.70 judge weight and 0.30 public weight', DATEADD(DAY, -30, SYSDATETIME())),
(2, 2, 'JUDGE_ASSIGNED', 'JudgeAssignment', 1, 'Assigned Dr. Marcus Miller to Excellence in AI Innovation', DATEADD(DAY, -30, SYSDATETIME())),
(3, 14, 'CONFLICT_DECLARED', 'JudgeAssignment', 7, 'Dr. Sophia Lindqvist recused from Category 1: past co-author conflict', DATEADD(DAY, -28, SYSDATETIME())),
(4, 3, 'SCORE_SUBMITTED', 'Evaluation', 1, 'Dr. Marcus Miller submitted score 92.5000 for Nomination 1', DATEADD(DAY, -12, SYSDATETIME())),
(5, 4, 'SCORE_VERIFIED', 'Evaluation', 3, 'Prof. Elena Vance submitted score 94.0000 for Nomination 1 (Verified)', DATEADD(DAY, -10, SYSDATETIME())),
(6, 2, 'RESULT_CALCULATED', 'ResultSet', 1, 'Automated scoring engine computed rankings for Category 1', DATEADD(HOUR, -6, SYSDATETIME())),
(7, 2, 'RESULT_PUBLISHED', 'ResultSet', 1, 'Published certified results for Category 1 to public leaderboard', DATEADD(HOUR, -5, SYSDATETIME())),
(8, 2, 'RESULT_CALCULATED', 'ResultSet', 3, 'Scoring engine generated draft rankings for Cloud Architecture', DATEADD(HOUR, -2, SYSDATETIME()));

SET IDENTITY_INSERT evaluation_audit_log OFF;
GO

-- =============================================================================
-- 15. REPORTS & ANALYTICS (All 6 Report Types: NOMINATION, VOTING, EVALUATION, WINNER, TIE, PARTICIPATION; Formats: PDF, CSV, EXCEL)
-- =============================================================================
SET IDENTITY_INSERT report ON;

INSERT INTO report (id, report_type, category_id, content, generated_by, format, archived, created_at) VALUES
-- Report 1: WINNER (PDF)
(1, 'WINNER', 1,
 'OFFICIAL 2025 CERTIFIED WINNER REPORT: Excellence in AI Innovation. Winner: Alex Rivera (NeuralFlow: Low-Latency Edge LLM) with a certified composite score of 95.28. Runner-Up: Clara Oswald (EcoVision). Certified by Elena Rostova, Lead Organizer.',
 'Elena Rostova', 'PDF', 0, DATEADD(HOUR, -5, SYSDATETIME())),

-- Report 2: VOTING (CSV)
(2, 'VOTING', 1,
 'VOTING AUDIT EXPORT: Total ballots cast: 2. Validated NIC checks: 100%. Anomaly count: 0. Integrity verified by Automated Ballot Ledger.',
 'Elena Rostova', 'CSV', 0, DATEADD(HOUR, -4, SYSDATETIME())),

-- Report 3: EVALUATION (PDF)
(3, 'EVALUATION', 1,
 'JUDGE EVALUATION BREAKDOWN: Category 1 (Excellence in AI Innovation). 2 judges submitted (Dr. Miller: 92.50; Prof. Vance: 94.00). Normalization method: MEAN.',
 'Dr. Marcus Miller', 'PDF', 0, DATEADD(HOUR, -4, SYSDATETIME())),

-- Report 4: NOMINATION (EXCEL)
(4, 'NOMINATION', NULL,
 'NOMINATION CYCLE SUMMARY: Total submissions: 11. Approved: 7, Submitted: 1, Under Review: 1, Draft: 1, Rejected: 1. Full eligibility audit log included.',
 'Sofia Chen', 'EXCEL', 0, DATEADD(DAY, -1, SYSDATETIME())),

-- Report 5: TIE (PDF)
(5, 'TIE', 3,
 'TIE RESOLUTION PROTOCOL REPORT: Category 3 (Outstanding Cloud Architecture). Ties resolved using Section 4.2 of Evaluation Bylaws (Judge Domain Score dominance).',
 'Elena Rostova', 'PDF', 0, DATEADD(HOUR, -2, SYSDATETIME())),

-- Report 6: PARTICIPATION (PDF)
(6, 'PARTICIPATION', NULL,
 'GLOBAL PARTICIPATION & DEMOGRAPHIC ANALYSIS: 22 registered platform participants across 9 global regions. 5 distinct categories, 6 active voter ballots cast.',
 'Elena Rostova', 'PDF', 0, DATEADD(DAY, -2, SYSDATETIME())),

-- Report 7: ARCHIVED WINNER REPORT (Archived historical report demonstration)
(7, 'WINNER', 6,
 'ARCHIVED HISTORICAL REPORT: Legacy Enterprise Software 2024 Final Winners Record. Stored for compliance accreditation.',
 'System Administrator', 'PDF', 1, DATEADD(DAY, -290, SYSDATETIME()));

SET IDENTITY_INSERT report OFF;
GO

SET IDENTITY_INSERT analytics_snapshot ON;

INSERT INTO analytics_snapshot (id, metric_name, metric_value, category_id, captured_at) VALUES
(1, 'TOTAL_NOMINATIONS_SUBMITTED', 11.0, NULL, DATEADD(HOUR, -1, SYSDATETIME())),
(2, 'VERIFICATION_PASS_RATE', 87.5, NULL, DATEADD(HOUR, -1, SYSDATETIME())),
(3, 'AVERAGE_JUDGE_SCORE_CATEGORY_1', 90.75, 1, DATEADD(HOUR, -2, SYSDATETIME())),
(4, 'VOTER_TURNOUT_RATE', 75.0, 4, DATEADD(HOUR, -1, SYSDATETIME())),
(5, 'AUDIT_INTEGRITY_SCORE', 100.0, NULL, DATEADD(HOUR, -1, SYSDATETIME()));

SET IDENTITY_INSERT analytics_snapshot OFF;
GO

-- =============================================================================
-- 16. FEEDBACK & REPLIES (All 4 Feedback Types: PRAISE, SUGGESTION, BUG, COMPLAINT; Statuses: OPEN, IN_PROGRESS, RESOLVED, CLOSED)
-- =============================================================================
SET IDENTITY_INSERT feedback ON;

INSERT INTO feedback (id, user_id, subject, message, feedback_type, status, rating, category_id, created_at, updated_at) VALUES
-- ID 1: PRAISE (Status: RESOLVED)
(1, 7, 'Seamless and transparent voting experience',
 'The two-step verification was smooth and the nomination summary cards gave great context before casting my vote. Very clean UI!',
 'PRAISE', 'RESOLVED', 5, 1, DATEADD(DAY, -2, SYSDATETIME()), DATEADD(DAY, -1, SYSDATETIME())),

-- ID 2: SUGGESTION (Status: IN_PROGRESS)
(2, 8, 'Add dark mode toggle for night evaluations',
 'During long scoring sessions, an OLED dark mode would be much easier on the eyes. Otherwise the evaluation dashboard is fantastic.',
 'SUGGESTION', 'IN_PROGRESS', 4, 1, DATEADD(DAY, -1, SYSDATETIME()), SYSDATETIME()),

-- ID 3: BUG (Status: RESOLVED)
(3, 17, 'Upload button spinner was stuck on 10MB PDF',
 'When uploading my 9.8MB architectural whitepaper, the progress spinner kept turning for 15 seconds after upload completed.',
 'BUG', 'RESOLVED', 3, 4, DATEADD(DAY, -3, SYSDATETIME()), DATEADD(DAY, -2, SYSDATETIME())),

-- ID 4: COMPLAINT (Status: OPEN - Awaiting review by organizer)
(4, 18, 'Rejection reason clarification requested',
 'My national ID photo was rejected as blurry, but my phone camera was clear. Can I get a manual inspection by an organizer?',
 'COMPLAINT', 'OPEN', 2, 1, DATEADD(HOUR, -6, SYSDATETIME()), SYSDATETIME()),

-- ID 5: PRAISE (Status: CLOSED)
(5, 5, 'Transparent scoring rubrics',
 'Having access to the exact scoring criteria and weighting helped our team prepare a much better technical whitepaper.',
 'PRAISE', 'CLOSED', 5, 1, DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, -3, SYSDATETIME()));

SET IDENTITY_INSERT feedback OFF;
GO

SET IDENTITY_INSERT feedback_reply ON;

INSERT INTO feedback_reply (id, feedback_id, replied_by, message, replied_at) VALUES
-- Reply to Praise (Feedback 1)
(1, 1, 2, 'Thank you Sarah! We are committed to making democratic participation as transparent and accessible as possible.', DATEADD(DAY, -1, SYSDATETIME())),

-- Reply to Bug (Feedback 3) by IT Coordinator
(2, 3, 11, 'Hi Devon, we deployed an optimized chunked upload handler in patch 1.4.2 that displays instant completion feedback. Thanks for reporting!', DATEADD(DAY, -2, SYSDATETIME())),

-- Reply to Suggestion (Feedback 2) by Lead Organizer
(3, 2, 2, 'Thank you David. The UX team has added the OLED dark mode theme to Sprint 4 backlog. Stay tuned!', DATEADD(HOUR, -12, SYSDATETIME()));

SET IDENTITY_INSERT feedback_reply OFF;
GO

-- =============================================================================
-- VERIFICATION CONFIRMATION
-- =============================================================================
PRINT '=============================================================================';
PRINT 'AwardHub Comprehensive Demonstration Seed Data loaded successfully!';
PRINT 'All 9 User Roles, 4 Account Statuses, 5 Category Statuses, 5 Nomination Statuses,';
PRINT '3 Evaluation Modes, 4 Result Statuses, and all Document & Report variations are active.';
PRINT 'Default password for all demo accounts: password123';
PRINT '=============================================================================';
GO
