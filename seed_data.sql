-- =============================================================================
-- AwardHub: MS SQL Server Seed Data Script
-- Target Database: awardhub2
-- Default Credentials: password123 (for all users)
-- =============================================================================

USE awardhub2;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Ensure MS SQL Server compatibility: convert any legacy TEXT columns to VARCHAR(MAX) so LOWER() queries succeed
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

-- 1. CLEANUP (In reverse dependency order to avoid foreign key violations)
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
DELETE FROM evaluation_audit_log;
DELETE FROM audit_logs;
DELETE FROM nominations;
DELETE FROM categories;
DELETE FROM nominees;
DELETE FROM users;
GO

-- 2. USERS
-- Password for all seed users is 'password123'
-- BCrypt Hash: $2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS
SET IDENTITY_INSERT users ON;

INSERT INTO users (
    id, user_type, username, email, password, role, full_name, active,
    contact_number, registration_date, account_status, nic, bio,
    location, website, avatar, notif_email, notif_sms, notif_results, last_login
) VALUES
-- ID 1: System Admin
(1, 'User', 'admin', 'admin@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'ADMIN', 'System Administrator', 1,
 '+1-555-0100', SYSDATETIME(), 'ACTIVE', 'NIC-ADM-001', 'Chief System Administrator for AwardHub platform.',
 'San Francisco, CA', 'https://awardhub.org', 'AD', 1, 0, 1, SYSDATETIME()),

-- ID 2: Lead Organizer
(2, 'User', 'organizer_lead', 'organizer@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'ORGANIZER', 'Elena Rostova', 1,
 '+1-555-0101', SYSDATETIME(), 'ACTIVE', 'NIC-ORG-002', 'Head of Annual Global Tech & Innovation Awards.',
 'Boston, MA', 'https://techawards.global', 'ER', 1, 1, 1, SYSDATETIME()),

-- ID 3: Chief Judge
(3, 'User', 'dr_miller', 'judge.miller@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Dr. Marcus Miller', 1,
 '+1-555-0102', SYSDATETIME(), 'ACTIVE', 'NIC-JDG-003', 'Professor of Computer Science & AI Ethics at MIT.',
 'Cambridge, MA', 'https://mit.edu/mmiller', 'MM', 1, 0, 1, SYSDATETIME()),

-- ID 4: Associate Judge
(4, 'User', 'prof_elena', 'judge.elena@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'JUDGE', 'Prof. Elena Vance', 1,
 '+1-555-0103', SYSDATETIME(), 'ACTIVE', 'NIC-JDG-004', 'Senior Cloud Solutions Architect & IEEE Fellow.',
 'Seattle, WA', 'https://ieee.org/evance', 'EV', 1, 0, 1, SYSDATETIME()),

-- ID 5: Nominee
(5, 'NOMINEE', 'nominee_alex', 'nominee.alex@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Alex Rivera', 1,
 '+1-555-0104', SYSDATETIME(), 'ACTIVE', 'NIC-NOM-005', 'Founder & Chief Architect at NeuralFlow AI.',
 'Austin, TX', 'https://neuralflow.io', 'AR', 1, 0, 1, SYSDATETIME()),

-- ID 6: Nominee 2
(6, 'NOMINEE', 'nominee_clara', 'nominee.clara@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'NOMINEE', 'Clara Oswald', 1,
 '+1-555-0105', SYSDATETIME(), 'ACTIVE', 'NIC-NOM-006', 'VP of Engineering at EcoGreen Energy Systems.',
 'Portland, OR', 'https://ecogreen.org', 'CO', 1, 0, 1, SYSDATETIME()),

-- ID 7: Verified Voter
(7, 'User', 'voter_sarah', 'sarah.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'Sarah Jenkins', 1,
 '+1-555-0106', SYSDATETIME(), 'ACTIVE', 'NIC-VOT-007', 'Independent Software Engineer & Community Advocate.',
 'Chicago, IL', '', 'SJ', 1, 0, 1, SYSDATETIME()),

-- ID 8: Verified Voter 2
(8, 'User', 'voter_david', 'david.voter@awardhub.com', '$2a$10$tkg/OJ4KueavxE99i3KxPevjcpJRiiI1itodAT/HBbqd04djuiomS', 'VOTER', 'David Kim', 1,
 '+1-555-0107', SYSDATETIME(), 'ACTIVE', 'NIC-VOT-008', 'Data Analyst & Tech Enthusiast.',
 'San Jose, CA', '', 'DK', 1, 0, 1, SYSDATETIME());

SET IDENTITY_INSERT users OFF;
GO

-- 3. NOMINEES EXTENDED PROFILE (Joined Inheritance)
INSERT INTO nominees (
    id, nic_passport, date_of_birth, gender,
    street, city, state, zip,
    organization, job_title, biography,
    education, achievements, nominee_references
) VALUES
(5, 'NIC-NOM-005', '1988-04-12', 'Non-Binary',
 '450 Innovation Way', 'Austin', 'TX', '78701',
 'NeuralFlow AI', 'Chief Architect',
 'Leading research in efficient transformer models and edge computer vision inference.',
 'M.S. in Computer Science (Stanford University); B.S. in Mathematics (UC Berkeley)',
 'Published 8 papers in NeurIPS; Recipient of 2024 AI Pioneer Award',
 'Dr. Marcus Miller (MIT), Dr. Susan Lee (Stanford)'),

(6, 'NIC-NOM-006', '1991-09-24', 'Female',
 '820 Green Valley Blvd', 'Portland', 'OR', '97201',
 'EcoGreen Energy Systems', 'VP of Engineering',
 'Pioneering smart-grid telemetry and distributed renewable energy automation platforms.',
 'M.S. in Electrical & Computer Engineering (Carnegie Mellon)',
 'Patent holder for adaptive battery balancing microgrids; CleanTech 40 Under 40',
 'Elena Vance (IEEE Fellow), Peter Capaldi (Glasgow Energy)');
GO

-- 4. CATEGORIES
SET IDENTITY_INSERT categories ON;

INSERT INTO categories (
    id, award_event_id, name, description, rules,
    nominee_eligibility, voter_eligibility, nomination_requirements,
    nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date,
    status, created_at, updated_at, created_by
) VALUES
(1, 1, 'Excellence in AI Innovation',
 'Honoring breakthrough artificial intelligence solutions that deliver transformative real-world value.',
 'All submissions must include a working demonstration, verifiable benchmarks, and ethical compliance review.',
 'Open to individual engineers, academic researchers, and registered tech startups.',
 'Any registered voter with an active, verified account may cast one vote.',
 'Technical whitepaper or executive architecture deck and public source/demo link.',
 DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME()),
 DATEADD(DAY, -9, SYSDATETIME()), DATEADD(DAY, 14, SYSDATETIME()),
 DATEADD(DAY, 16, SYSDATETIME()),
 'ACTIVE', DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME(), 'organizer_lead'),

(2, 1, 'Sustainability & Green Computing',
 'Recognizing sustainable software architectures and low-carbon infrastructure engineering.',
 'Candidate systems must demonstrate measurable energy reduction or carbon offset impact.',
 'Global software teams, cloud engineers, and corporate sustainability departments.',
 'Verified AwardHub voters.',
 'Verified energy consumption metrics or carbon audit summary document.',
 DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME()),
 DATEADD(DAY, -9, SYSDATETIME()), DATEADD(DAY, 14, SYSDATETIME()),
 DATEADD(DAY, 16, SYSDATETIME()),
 'ACTIVE', DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME(), 'organizer_lead'),

(3, 1, 'Outstanding Cloud Architecture',
 'Celebrating high-availability, highly resilient, and scalable modern cloud deployments.',
 'Designs must demonstrate zero downtime failover, multi-region elasticity, and robust security posture.',
 'DevOps architects, SRE teams, and platform engineering organizations.',
 'Verified AwardHub voters.',
 'Architecture diagrams, SLO/SLA metrics report, and disaster recovery summary.',
 DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME()),
 DATEADD(DAY, -9, SYSDATETIME()), DATEADD(DAY, 14, SYSDATETIME()),
 DATEADD(DAY, 16, SYSDATETIME()),
 'ACTIVE', DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME(), 'organizer_lead');

SET IDENTITY_INSERT categories OFF;
GO

-- 5. CATEGORY CRITERIA
SET IDENTITY_INSERT category_criteria ON;

INSERT INTO category_criteria (id, category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(1, 1, 'Technical Innovation', 'Novelty of the model architecture and algorithm design.', 0.40, 10, SYSDATETIME(), SYSDATETIME()),
(2, 1, 'Real-World Impact', 'Measurable industry or societal benefit delivered.', 0.35, 10, SYSDATETIME(), SYSDATETIME()),
(3, 1, 'Ethical Governance', 'Data privacy safeguards, fairness checks, and transparency.', 0.25, 10, SYSDATETIME(), SYSDATETIME()),

(4, 2, 'Energy Efficiency', 'Quantified reduction in watt-hours per transaction or query.', 0.50, 10, SYSDATETIME(), SYSDATETIME()),
(5, 2, 'Scalability of Solution', 'Feasibility for wide enterprise adoption across sectors.', 0.50, 10, SYSDATETIME(), SYSDATETIME());

SET IDENTITY_INSERT category_criteria OFF;
GO

-- 6. CATEGORY JUDGES & EVALUATION ASSIGNMENTS
SET IDENTITY_INSERT category_judges ON;

INSERT INTO category_judges (id, category_id, judge_id, assigned_at, assigned_by) VALUES
(1, 1, 3, SYSDATETIME(), 'organizer_lead'),
(2, 1, 4, SYSDATETIME(), 'organizer_lead'),
(3, 2, 3, SYSDATETIME(), 'organizer_lead'),
(4, 3, 4, SYSDATETIME(), 'organizer_lead');

SET IDENTITY_INSERT category_judges OFF;
GO

SET IDENTITY_INSERT judge_assignment ON;

INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at, conflict_note) VALUES
(1, 1, 3, 'Dr. Marcus Miller', 'ASSIGNED', SYSDATETIME(), NULL),
(2, 1, 4, 'Prof. Elena Vance', 'ASSIGNED', SYSDATETIME(), NULL),
(3, 2, 3, 'Dr. Marcus Miller', 'ASSIGNED', SYSDATETIME(), NULL),
(4, 3, 4, 'Prof. Elena Vance', 'ASSIGNED', SYSDATETIME(), NULL);

SET IDENTITY_INSERT judge_assignment OFF;
GO

-- 7. EVALUATION SCHEMES
SET IDENTITY_INSERT evaluation_scheme ON;

INSERT INTO evaluation_scheme (
    id, category_id, category_name, mode,
    judge_weight, public_weight, aggregation_method,
    vote_normalization, min_judges_required, blind_review, locked,
    evaluation_opens_at, evaluation_closes_at
) VALUES
(1, 1, 'Excellence in AI Innovation', 'HYBRID',
 0.7000, 0.3000, 'MEAN', 'MAX_IN_CATEGORY', 1, 0, 0,
 DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, 10, SYSDATETIME())),

(2, 2, 'Sustainability & Green Computing', 'HYBRID',
 0.6000, 0.4000, 'MEAN', 'MAX_IN_CATEGORY', 1, 0, 0,
 DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, 10, SYSDATETIME())),

(3, 3, 'Outstanding Cloud Architecture', 'JUDGE_ONLY',
 1.0000, 0.0000, 'MEAN', 'MAX_IN_CATEGORY', 1, 0, 0,
 DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, 10, SYSDATETIME()));

SET IDENTITY_INSERT evaluation_scheme OFF;
GO

-- 8. RUBRICS & RUBRIC CRITERIA
SET IDENTITY_INSERT rubric ON;

INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES
(1, 1, 'AI Evaluation Matrix v1', 1, 1, 10, 1),
(2, 2, 'Green Metrics Scoring v1', 1, 1, 10, 1),
(3, 3, 'Cloud Resilience Matrix v1', 1, 1, 10, 1);

SET IDENTITY_INSERT rubric OFF;
GO

SET IDENTITY_INSERT rubric_criterion ON;

INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES
(1, 1, 'Algorithmic Novelty', 'Originality of foundational architecture and neural design.', 0.4000, 1),
(2, 1, 'Real-world Deployment', 'Production reliability, latency SLAs, and client impact.', 0.3500, 2),
(3, 1, 'Responsible AI Safeguards', 'Model interpretability, bias evaluation, and data privacy.', 0.2500, 3),

(4, 2, 'Carbon Intensity Reduction', 'Measured reduction in power draw and greenhouse footprint.', 0.5000, 1),
(5, 2, 'Lifecycle Circularity', 'Hardware efficiency and sustainable operational lifespan.', 0.5000, 2),

(6, 3, 'Fault Tolerance & RTO', 'Recovery time objective and chaos resilience test results.', 0.5000, 1),
(7, 3, 'Cloud Cost Optimization', 'Cost efficiency per billion operations executed.', 0.5000, 2);

SET IDENTITY_INSERT rubric_criterion OFF;
GO

-- 9. NOMINATIONS
SET IDENTITY_INSERT nominations ON;

INSERT INTO nominations (
    id, category_id, nominee_id, title, description,
    supporting_document, status, rejection_reason, reviewed_by, reviewed_at,
    created_at, updated_at
) VALUES
-- Category 1: AI Innovation
(1, 1, 5, 'NeuralFlow: Low-Latency Edge LLM Inference Engine',
 'NeuralFlow compresses billion-parameter foundation models to run on resource-constrained microcontrollers with sub-10ms response times.',
 'https://neuralflow.io/whitepaper-2025.pdf', 'APPROVED', NULL, 2, SYSDATETIME(),
 DATEADD(DAY, -15, SYSDATETIME()), SYSDATETIME()),

(2, 1, 6, 'EcoVision: AI-Powered Wildfire Prevention Sensor Mesh',
 'An autonomous computer-vision edge network deployed in national parks that identifies early canopy smoke signatures within 30 seconds.',
 'https://ecogreen.org/reports/ecovision-early-smoke.pdf', 'APPROVED', NULL, 2, SYSDATETIME(),
 DATEADD(DAY, -14, SYSDATETIME()), SYSDATETIME()),

-- Category 2: Green Computing
(3, 2, 6, 'ZeroGrid: Adaptive Microgrid Battery Balancing Controller',
 'Distributed firmware orchestration eliminating peak-hour thermal stress on municipal battery energy storage facilities.',
 'https://ecogreen.org/zerogrid-whitepaper.pdf', 'APPROVED', NULL, 2, SYSDATETIME(),
 DATEADD(DAY, -12, SYSDATETIME()), SYSDATETIME()),

(4, 2, 5, 'CarbonZero: Dynamic Server Power Modulation Platform',
 'Kubernetes scheduler scheduler extension that shifts non-urgent batch workloads to regions running on 100% surplus wind and solar power.',
 'https://neuralflow.io/carbonzero.pdf', 'APPROVED', NULL, 2, SYSDATETIME(),
 DATEADD(DAY, -11, SYSDATETIME()), SYSDATETIME()),

-- Category 3: Cloud Architecture
(5, 3, 5, 'OmniMesh: Global Multi-Cloud Active-Active Service Mesh',
 'Peer-to-peer federated service mesh enabling seamless failover across AWS, Azure, and Google Cloud with sub-millisecond route synchronization.',
 'https://neuralflow.io/omnimesh-architecture.pdf', 'APPROVED', NULL, 2, SYSDATETIME(),
 DATEADD(DAY, -10, SYSDATETIME()), SYSDATETIME());

SET IDENTITY_INSERT nominations OFF;
GO

-- 10. PUBLIC VOTES
SET IDENTITY_INSERT votes ON;

INSERT INTO votes (id, category_id, nomination_id, voter_id, nic, casted_at) VALUES
-- Category 1: AI Innovation
(1, 1, 1, 7, 'NIC-VOT-007', DATEADD(HOUR, -48, SYSDATETIME())),
(2, 1, 2, 8, 'NIC-VOT-008', DATEADD(HOUR, -24, SYSDATETIME())),

-- Category 2: Green Computing
(3, 2, 3, 7, 'NIC-VOT-007', DATEADD(HOUR, -36, SYSDATETIME())),
(4, 2, 3, 8, 'NIC-VOT-008', DATEADD(HOUR, -12, SYSDATETIME()));

SET IDENTITY_INSERT votes OFF;
GO

-- 11. JUDGE EVALUATIONS & CRITERION SCORES
SET IDENTITY_INSERT evaluation ON;

INSERT INTO evaluation (
    id, nomination_id, category_id, judge_id, rubric_id,
    status, total_score, comments, submitted_at, updated_at
) VALUES
-- Evaluation for Nomination 1 by Dr. Marcus Miller (Judge ID 3)
(1, 1, 1, 3, 1, 'SUBMITTED', 92.5000,
 'Exceptional mathematical rigor in the quantization kernels. Quantifiable performance gains validated.',
 DATEADD(DAY, -2, SYSDATETIME()), SYSDATETIME()),

-- Evaluation for Nomination 2 by Dr. Marcus Miller (Judge ID 3)
(2, 2, 1, 3, 1, 'SUBMITTED', 87.0000,
 'Impressive field deployment metrics and very strong environmental relevance.',
 DATEADD(DAY, -1, SYSDATETIME()), SYSDATETIME());

SET IDENTITY_INSERT evaluation OFF;
GO

SET IDENTITY_INSERT criterion_score ON;

INSERT INTO criterion_score (id, evaluation_id, criterion_id, raw_score, note) VALUES
-- Scores for Evaluation 1
(1, 1, 1, 9.50, 'Novel quantization kernel algorithm.'),
(2, 1, 2, 9.00, 'Demonstrated across 10,000 edge nodes.'),
(3, 1, 3, 9.20, 'Clear transparency guidelines and reproducible benchmarks.'),

-- Scores for Evaluation 2
(4, 2, 1, 8.50, 'Standard CNN model customized for low-light conditions.'),
(5, 2, 2, 9.20, 'Zero false negatives observed in pilot test trials.'),
(6, 2, 3, 8.20, 'Good data privacy documentation for outdoor wildlife cameras.');

SET IDENTITY_INSERT criterion_score OFF;
GO

-- 12. PUBLISHED RESULT SETS & RANKINGS (Live Leaderboard)
SET IDENTITY_INSERT result_set ON;

INSERT INTO result_set (
    id, category_id, status, mode_snapshot,
    judge_weight_snapshot, public_weight_snapshot,
    calculated_at, published_at, published_by,
    recalculation_reason, version_no
) VALUES
(1, 1, 'PUBLISHED', 'HYBRID', 0.7000, 0.3000,
 DATEADD(HOUR, -4, SYSDATETIME()), DATEADD(HOUR, -3, SYSDATETIME()), 2,
 NULL, 1);

SET IDENTITY_INSERT result_set OFF;
GO

SET IDENTITY_INSERT result_entry ON;

INSERT INTO result_entry (
    id, result_set_id, nomination_id, nominee_name,
    judge_score, judges_counted, vote_count, vote_score,
    final_score, rank_position, winner, tie_break_note, excluded_reason
) VALUES
(1, 1, 1, 'Alex Rivera (NeuralFlow: Low-Latency Edge LLM)',
 92.5000, 1, 1, 50.0000, 79.7500, 1, 1, 'Clear winner on weighted hybrid score', NULL),

(2, 1, 2, 'Clara Oswald (EcoVision: Wildfire Prevention)',
 87.0000, 1, 1, 50.0000, 75.9000, 2, 0, NULL, NULL);

SET IDENTITY_INSERT result_entry OFF;
GO

-- 13. AUDIT LOGS (To populate Admin and Organizer Audit Views)
SET IDENTITY_INSERT audit_logs ON;

INSERT INTO audit_logs (logid, performed_by_user_id, action_type, entity_type, entity_id, details, timestamp) VALUES
(1, 1, 'USER_CREATED', 'User', 2, 'Created Organizer account for Elena Rostova', DATEADD(DAY, -30, SYSDATETIME())),
(2, 2, 'CATEGORY_PUBLISHED', 'Category', 1, 'Published category: Excellence in AI Innovation', DATEADD(DAY, -28, SYSDATETIME())),
(3, 2, 'NOMINATION_APPROVED', 'Nomination', 1, 'Approved NeuralFlow nomination after eligibility check', DATEADD(DAY, -15, SYSDATETIME())),
(4, 3, 'EVALUATION_SUBMITTED', 'Evaluation', 1, 'Dr. Marcus Miller submitted final scoring for Nomination 1', DATEADD(DAY, -2, SYSDATETIME())),
(5, 2, 'RESULTS_PUBLISHED', 'ResultSet', 1, 'Official winner publication certified by Organizer', DATEADD(HOUR, -3, SYSDATETIME()));

SET IDENTITY_INSERT audit_logs OFF;
GO

SET IDENTITY_INSERT evaluation_audit_log ON;

INSERT INTO evaluation_audit_log (id, actor_id, action, entity_type, entity_id, detail, occurred_at) VALUES
(1, 2, 'JUDGE_ASSIGNED', 'JudgeAssignment', 1, 'Assigned Dr. Marcus Miller to Excellence in AI Innovation', DATEADD(DAY, -20, SYSDATETIME())),
(2, 3, 'SCORE_SUBMITTED', 'Evaluation', 1, 'Submitted weighted score 92.5000 for Nomination 1', DATEADD(DAY, -2, SYSDATETIME())),
(3, 2, 'RESULT_CALCULATED', 'ResultSet', 1, 'Ran automated hybrid calculation engine for Category 1', DATEADD(HOUR, -4, SYSDATETIME())),
(4, 2, 'RESULT_PUBLISHED', 'ResultSet', 1, 'Published certified results for Category 1 to public leaderboard', DATEADD(HOUR, -3, SYSDATETIME()));

SET IDENTITY_INSERT evaluation_audit_log OFF;
GO

-- 14. REPORTS & ANALYTICS
SET IDENTITY_INSERT report ON;

INSERT INTO report (id, report_type, category_id, content, generated_by, format, archived, created_at) VALUES
(1, 'WINNER', 1, 'Official 2025 Certified Award Results for Excellence in AI Innovation. Winner: NeuralFlow (Alex Rivera) with hybrid score of 79.75.', 'Elena Rostova', 'PDF', 0, DATEADD(HOUR, -3, SYSDATETIME())),
(2, 'VOTING', 1, 'Voter Turnout & Integrity Audit Report. Total Verified Ballots Cast: 2. Zero anomaly flags detected.', 'Elena Rostova', 'PDF', 0, DATEADD(HOUR, -2, SYSDATETIME()));

SET IDENTITY_INSERT report OFF;
GO

-- 15. FEEDBACK ENTRIES
SET IDENTITY_INSERT feedback ON;

INSERT INTO feedback (id, user_id, subject, message, feedback_type, status, rating, category_id, created_at, updated_at) VALUES
(1, 7, 'Seamless voting process', 'The live voter interface was intuitive and the nomination criteria was very clear.', 'PRAISE', 'RESOLVED', 5, 1, DATEADD(DAY, -1, SYSDATETIME()), SYSDATETIME()),
(2, 8, 'Mobile view recommendation', 'The candidate comparison table looks great on desktop, would love swipe cards on small phones.', 'SUGGESTION', 'OPEN', 4, 1, DATEADD(HOUR, -5, SYSDATETIME()), SYSDATETIME());

SET IDENTITY_INSERT feedback OFF;
GO

PRINT 'AwardHub MS SQL Server seed data loaded successfully!';
GO
