-- Demo data for Module 5, matching the team's shared frontend mock data 1:1 so that
-- scoring, calculating and publishing through the real UI writes to real rows here.
-- Mapping (mock id -> this id) lives in frontend/src/api/evaluationApi.js.
--
-- IF NOT EXISTS guards make this safe to re-run on every restart (SQL Server has no
-- INSERT IGNORE). SET IDENTITY_INSERT is required because ids are explicit here.

-- ===================== Evaluation schemes (4 categories) =====================
SET IDENTITY_INSERT evaluation_scheme ON;

IF NOT EXISTS (SELECT 1 FROM evaluation_scheme WHERE id = 1)
INSERT INTO evaluation_scheme
  (id, category_id, category_name, mode, judge_weight, public_weight, aggregation_method,
   vote_normalization, min_judges_required, blind_review, locked)
VALUES (1, 1, 'Best Innovative Software Solution', 'HYBRID', 0.6000, 0.4000, 'MEAN', 'MAX_IN_CATEGORY', 1, 1, 0);

IF NOT EXISTS (SELECT 1 FROM evaluation_scheme WHERE id = 2)
INSERT INTO evaluation_scheme
  (id, category_id, category_name, mode, judge_weight, public_weight, aggregation_method,
   vote_normalization, min_judges_required, blind_review, locked)
VALUES (2, 2, 'Outstanding AI & Data Science Research', 'JUDGE_ONLY', 1.0000, 0.0000, 'MEAN', 'MAX_IN_CATEGORY', 1, 1, 0);

IF NOT EXISTS (SELECT 1 FROM evaluation_scheme WHERE id = 3)
INSERT INTO evaluation_scheme
  (id, category_id, category_name, mode, judge_weight, public_weight, aggregation_method,
   vote_normalization, min_judges_required, blind_review, locked)
VALUES (3, 3, 'Community Impact & Digital Inclusion', 'HYBRID', 0.4000, 0.6000, 'MEAN', 'MAX_IN_CATEGORY', 1, 1, 0);

IF NOT EXISTS (SELECT 1 FROM evaluation_scheme WHERE id = 4)
INSERT INTO evaluation_scheme
  (id, category_id, category_name, mode, judge_weight, public_weight, aggregation_method,
   vote_normalization, min_judges_required, blind_review, locked)
VALUES (4, 4, 'Emerging Young Tech Leader of the Year', 'HYBRID', 0.5000, 0.5000, 'MEAN', 'MAX_IN_CATEGORY', 1, 1, 0);

SET IDENTITY_INSERT evaluation_scheme OFF;


-- ===================== Rubrics (one per category, scale 1-10 to match the mock UI) =====================
SET IDENTITY_INSERT rubric ON;

IF NOT EXISTS (SELECT 1 FROM rubric WHERE id = 1)
INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES (1, 1, 'Best Innovative Software Solution rubric', 1, 1, 10, 1);
IF NOT EXISTS (SELECT 1 FROM rubric WHERE id = 2)
INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES (2, 2, 'Outstanding AI & Data Science Research rubric', 1, 1, 10, 1);
IF NOT EXISTS (SELECT 1 FROM rubric WHERE id = 3)
INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES (3, 3, 'Community Impact & Digital Inclusion rubric', 1, 1, 10, 1);
IF NOT EXISTS (SELECT 1 FROM rubric WHERE id = 4)
INSERT INTO rubric (id, category_id, name, version, scale_min, scale_max, active) VALUES (4, 4, 'Emerging Young Tech Leader rubric', 1, 1, 10, 1);

SET IDENTITY_INSERT rubric OFF;


-- ===================== Rubric criteria (weights sum to 1.00 per rubric) =====================
SET IDENTITY_INSERT rubric_criterion ON;

-- cat-1 (crit-1..crit-4): Innovation 30, Technical Depth 30, Impact 25, Presentation 15
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 1)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (1, 1, 'Innovation & Originality', 'Novelty of approach and uniqueness of technological design.', 0.3000, 0);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 2)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (2, 1, 'Technical Depth & Architecture', 'Code quality, system stability, performance, and security.', 0.3000, 1);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 3)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (3, 1, 'Real-world Societal Impact', 'Demonstrated value and address of tangible practical needs.', 0.2500, 2);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 4)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (4, 1, 'Presentation & Documentation', 'Clarity of documentation, architecture diagrams, and pitch.', 0.1500, 3);

-- cat-2 (crit-201..crit-203): Methodological Rigor 35, Scientific Novelty 35, Reproducibility 30
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 5)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (5, 2, 'Methodological Rigor', 'Soundness of mathematical grounding and experimental framework.', 0.3500, 0);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 6)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (6, 2, 'Scientific Novelty', 'Significance beyond state-of-the-art baselines.', 0.3500, 1);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 7)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (7, 2, 'Reproducibility & Code Quality', 'Clean repositories, benchmark transparency, and dataset availability.', 0.3000, 2);

-- cat-3 (crit-301..crit-303): Reach 40, Sustainability 30, Empowerment 30
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 8)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (8, 3, 'Scale of Community Reach', 'Number of people directly aided and geographic diversity.', 0.4000, 0);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 9)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (9, 3, 'Sustainability Model', 'Longevity and independence from one-off external funding.', 0.3000, 1);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 10)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (10, 3, 'Stakeholder Empowerment', 'Skills transfer and positive community independence.', 0.3000, 2);

-- cat-4 (crit-401..crit-403): Leadership 40, Vision 30, Integrity 30
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 11)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (11, 4, 'Leadership & Mentorship Impact', 'Demonstrated influence in guiding teams and peers.', 0.4000, 0);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 12)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (12, 4, 'Vision & Strategic Thinking', 'Ability to foresee problems and execute resilient solutions.', 0.3000, 1);
IF NOT EXISTS (SELECT 1 FROM rubric_criterion WHERE id = 13)
INSERT INTO rubric_criterion (id, rubric_id, name, description, weight, display_order) VALUES (13, 4, 'Integrity & Ethics', 'Commitment to high ethical standards and collaborative culture.', 0.3000, 2);

SET IDENTITY_INSERT rubric_criterion OFF;


-- ===================== Approved nominations (only approved ones reach evaluation) =====================
SET IDENTITY_INSERT nomination_ref ON;

IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 1)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (1, 1, 'Kavindu Perera', 'APPROVED');   -- BioScan
IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 2)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (2, 1, 'Dilshan Alwis', 'APPROVED');    -- SafeTransit
IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 3)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (3, 1, 'Ravindu Bandara', 'APPROVED');  -- EcoCharge
IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 4)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (4, 2, 'Dr. Suren Mendis', 'APPROVED'); -- Histopathology
IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 5)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (5, 1, 'Hashini Jayasuriya', 'UNDER_REVIEW'); -- AgriSense, not yet approved
IF NOT EXISTS (SELECT 1 FROM nomination_ref WHERE id = 6)
INSERT INTO nomination_ref (id, category_id, nominee_name, status) VALUES (6, 4, 'Methmi Samarakoon', 'APPROVED'); -- CodeForward SL

SET IDENTITY_INSERT nomination_ref OFF;


-- ===================== Public vote tallies (from the mock nomination stats) =====================
SET IDENTITY_INSERT vote_tally ON;

IF NOT EXISTS (SELECT 1 FROM vote_tally WHERE id = 1)
INSERT INTO vote_tally (id, nomination_id, category_id, vote_count) VALUES (1, 1, 1, 142);
IF NOT EXISTS (SELECT 1 FROM vote_tally WHERE id = 2)
INSERT INTO vote_tally (id, nomination_id, category_id, vote_count) VALUES (2, 2, 1, 188);
IF NOT EXISTS (SELECT 1 FROM vote_tally WHERE id = 3)
INSERT INTO vote_tally (id, nomination_id, category_id, vote_count) VALUES (3, 3, 1, 96);
IF NOT EXISTS (SELECT 1 FROM vote_tally WHERE id = 4)
INSERT INTO vote_tally (id, nomination_id, category_id, vote_count) VALUES (4, 6, 4, 320);

SET IDENTITY_INSERT vote_tally OFF;


-- ===================== Judge assignments (matching each category's assignedJudges) =====================
SET IDENTITY_INSERT judge_assignment ON;

IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 1)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (1, 1, 1, 'Dr. Anoma Wijesinghe', 'ASSIGNED', GETDATE());
IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 2)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (2, 1, 2, 'Mr. Roshan Wickramaratne', 'ASSIGNED', GETDATE());
IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 3)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (3, 2, 1, 'Dr. Anoma Wijesinghe', 'ASSIGNED', GETDATE());
IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 4)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (4, 3, 2, 'Mr. Roshan Wickramaratne', 'ASSIGNED', GETDATE());
IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 5)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (5, 4, 1, 'Dr. Anoma Wijesinghe', 'ASSIGNED', GETDATE());
IF NOT EXISTS (SELECT 1 FROM judge_assignment WHERE id = 6)
INSERT INTO judge_assignment (id, category_id, judge_id, judge_name, status, assigned_at) VALUES (6, 4, 2, 'Mr. Roshan Wickramaratne', 'ASSIGNED', GETDATE());

SET IDENTITY_INSERT judge_assignment OFF;