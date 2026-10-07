-- ============================================================
-- AwardHub — Add sample data (SSMS, SQL Server)
-- Adds ONE voting contest + organizers with team + nominees
-- + user accounts with votes. All demo passwords: password123
-- IDEMPOTENT: safe to re-run (skips rows that already exist,
-- resolves ids by email/name instead of hardcoded values).
-- Run in SSMS against the `awardhub` database, top to bottom.
-- ============================================================
USE awardhub;
GO

DECLARE @pwd NVARCHAR(100) = N'$2a$10$MbhMiLl.vPMef9139vkLC.kBDPhlHmnkkJrcG77g2NaXM2spIjWOO'; -- password123

-- ------------------------------------------------------------
-- 1. USER ACCOUNTS (insert only missing emails)
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'dinesh@awardhub.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Dinesh Kumara', N'dinesh@awardhub.lk', @pwd, N'198801234567', 'HEAD_ORGANIZER', 'active', N'DK', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'tharushi@awardhub.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Tharushi Mendis', N'tharushi@awardhub.lk', @pwd, N'199601234568', 'ORGANIZING_TEAM_MEMBER', 'active', N'TM', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'arjun@email.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, bio, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Arjun Rathnayake', N'arjun@email.lk', @pwd, N'199901234569', 'NOMINEE', 'active', N'Upcoming director from Galle.', N'AR', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'nadeesha@email.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Nadeesha Fernando', N'nadeesha@email.lk', @pwd, N'200201234570', 'NOMINEE', 'active', N'NF', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'suresh@email.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Suresh Bandara', N'suresh@email.lk', @pwd, N'199001234571', 'VOTER', 'active', N'SB', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'kamala@email.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Kamala Devi', N'kamala@email.lk', @pwd, N'199301234572', 'VOTER', 'active', N'KD', 1, 0, 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'amal@email.lk')
    INSERT INTO dbo.users (name, email, password_hash, nic, role, status, avatar, notif_email, notif_sms, notif_results, created_at)
    VALUES (N'Amal Jayasuriya', N'amal@email.lk', @pwd, N'199701234573', 'VOTER', 'active', N'AJ', 1, 0, 1, SYSUTCDATETIME());
GO

-- ------------------------------------------------------------
-- 2. VOTING CONTEST (skip if a contest with this name exists)
-- ------------------------------------------------------------
DECLARE @headId BIGINT = (SELECT id FROM dbo.users WHERE email = 'dinesh@awardhub.lk');

IF NOT EXISTS (SELECT 1 FROM dbo.votings WHERE name = N'Best Short Film 2026')
    INSERT INTO dbo.votings (name, description, eligibility, image_url, has_judging, nomination_start, nomination_end, voting_start, voting_end, judging_start, judging_end, status, head_organizer_id, created_at)
    VALUES (N'Best Short Film 2026', N'Celebrating short-form storytelling under 30 minutes.', N'Runtime under 30 min, released 2025–2026', NULL, 0,
            '2026-09-20', '2026-10-04', '2026-10-05', '2026-11-10', NULL, NULL, 'voting', @headId, SYSUTCDATETIME());
GO

-- ------------------------------------------------------------
-- 3. ORGANIZING TEAM (skip if already a member of this contest)
-- ------------------------------------------------------------
DECLARE @votingId BIGINT = (SELECT id FROM dbo.votings WHERE name = N'Best Short Film 2026');
DECLARE @teamId  BIGINT = (SELECT id FROM dbo.users WHERE email = 'tharushi@awardhub.lk');
DECLARE @headId2 BIGINT = (SELECT id FROM dbo.users WHERE email = 'dinesh@awardhub.lk');

IF @votingId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.organizing_team_members WHERE voting_id = @votingId AND user_id = @teamId)
    INSERT INTO dbo.organizing_team_members (voting_id, user_id, added_by_id, added_at, status)
    VALUES (@votingId, @teamId, @headId2, SYSUTCDATETIME(), 'active');
GO

-- ------------------------------------------------------------
-- 4. NOMINEES for the contest (skip existing blind codes; approved so they accept votes)
-- ------------------------------------------------------------
DECLARE @vId   BIGINT = (SELECT id FROM dbo.votings WHERE name = N'Best Short Film 2026');
DECLARE @nom1  BIGINT = (SELECT id FROM dbo.users WHERE email = 'arjun@email.lk');
DECLARE @nom2  BIGINT = (SELECT id FROM dbo.users WHERE email = 'nadeesha@email.lk');

IF @vId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.nominations WHERE voting_id = @vId AND blind_code = N'SHORT-001')
    INSERT INTO dbo.nominations (voting_id, nominee_id, nominee_name, statement, bio, evidence, portfolio, status, blind_code, vote_count, submitted_at)
    VALUES (@vId, @nom1, N'Arjun Rathnayake', N'16-minute drama about a lighthouse keeper''s last night on duty.', N'Director', N'Festival selection proof, runtime certificate', NULL, 'approved', N'SHORT-001', 2, SYSUTCDATETIME());

IF @vId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.nominations WHERE voting_id = @vId AND blind_code = N'SHORT-002')
    INSERT INTO dbo.nominations (voting_id, nominee_id, nominee_name, statement, bio, evidence, portfolio, status, blind_code, vote_count, submitted_at)
    VALUES (@vId, @nom2, N'Nadeesha Fernando', N'Documentary short on traditional mask-making in Ambalangoda.', N'Director', N'Screening link, press kit', NULL, 'approved', N'SHORT-002', 1, SYSUTCDATETIME());

IF @vId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.nominations WHERE voting_id = @vId AND blind_code = N'SHORT-003')
    INSERT INTO dbo.nominations (voting_id, nominee_id, nominee_name, statement, bio, evidence, portfolio, status, blind_code, vote_count, submitted_at)
    VALUES (@vId, NULL, N'The Night Bus', N'Ensemble short set on a Colombo night bus.', NULL, N'Streaming link, cast list', NULL, 'approved', N'SHORT-003', 0, SYSUTCDATETIME());
GO

-- ------------------------------------------------------------
-- 5. VOTES (one per voter per voting — skips existing voter+contest pairs)
-- ------------------------------------------------------------
DECLARE @vv   BIGINT = (SELECT id FROM dbo.votings WHERE name = N'Best Short Film 2026');
DECLARE @n12  BIGINT = (SELECT id FROM dbo.nominations WHERE voting_id = @vv AND blind_code = N'SHORT-001');
DECLARE @n13  BIGINT = (SELECT id FROM dbo.nominations WHERE voting_id = @vv AND blind_code = N'SHORT-002');
DECLARE @suresh BIGINT = (SELECT id FROM dbo.users WHERE email = 'suresh@email.lk');
DECLARE @kamala BIGINT = (SELECT id FROM dbo.users WHERE email = 'kamala@email.lk');
DECLARE @amal   BIGINT = (SELECT id FROM dbo.users WHERE email = 'amal@email.lk');

IF @vv IS NOT NULL AND @n12 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.votes WHERE voting_id = @vv AND voter_id = @suresh)
    INSERT INTO dbo.votes (voting_id, nomination_id, voter_id, nic, casted_at)
    VALUES (@vv, @n12, @suresh, N'199001234571', SYSUTCDATETIME());

IF @vv IS NOT NULL AND @n12 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.votes WHERE voting_id = @vv AND voter_id = @kamala)
    INSERT INTO dbo.votes (voting_id, nomination_id, voter_id, nic, casted_at)
    VALUES (@vv, @n12, @kamala, N'199301234572', SYSUTCDATETIME());

IF @vv IS NOT NULL AND @n13 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.votes WHERE voting_id = @vv AND voter_id = @amal)
    INSERT INTO dbo.votes (voting_id, nomination_id, voter_id, nic, casted_at)
    VALUES (@vv, @n13, @amal, N'199701234573', SYSUTCDATETIME());
GO

-- ------------------------------------------------------------
-- 6. VERIFY (expect: 1 contest, 1 team row, 3 nominees, 3 votes)
-- ------------------------------------------------------------
DECLARE @checkId BIGINT = (SELECT id FROM dbo.votings WHERE name = N'Best Short Film 2026');
SELECT id, name, status, head_organizer_id FROM dbo.votings WHERE id = @checkId;
SELECT * FROM dbo.organizing_team_members WHERE voting_id = @checkId;
SELECT id, nominee_name, status, vote_count FROM dbo.nominations WHERE voting_id = @checkId;
SELECT id, voter_id, nomination_id, nic FROM dbo.votes WHERE voting_id = @checkId;
GO
