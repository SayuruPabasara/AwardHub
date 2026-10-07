-- ============================================================
-- FIX: one organizer → one contest
-- Run in SSMS against the `awardhub` database.
-- Safe to re-run (every step is guarded).
--
-- What it does:
--  1. REPORTS head organizers / team members assigned to >1 contest
--  2. REPAIRS head-organizer duplicates (keeps lowest voting id, NULLs rest)
--  3. REPAIRS team-member duplicates (keeps earliest row, deletes rest)
--  4. ADDS a filtered UNIQUE index so SQL Server rejects future duplicates
--     at the database level (service layer also validates with 400 errors)
-- ============================================================
USE awardhub;
GO

-- ------------------------------------------------------------
-- STEP 1 — REPORT: head organizers heading >1 contest
-- ------------------------------------------------------------
SELECT u.id AS user_id, u.name, u.email, COUNT(*) AS contest_count,
       STRING_AGG(CAST(v.id AS NVARCHAR(20)) + ' (' + v.name + ')', ', ') AS contests
FROM dbo.votings v
JOIN dbo.users u ON u.id = v.head_organizer_id
WHERE v.head_organizer_id IS NOT NULL
GROUP BY u.id, u.name, u.email
HAVING COUNT(*) > 1;
GO

-- ------------------------------------------------------------
-- STEP 1b — REPORT: team members serving >1 contest (active rows)
-- ------------------------------------------------------------
SELECT u.id AS user_id, u.name, u.email, COUNT(DISTINCT m.voting_id) AS contest_count,
       STRING_AGG(CAST(m.voting_id AS NVARCHAR(20)), ', ') AS voting_ids
FROM dbo.organizing_team_members m
JOIN dbo.users u ON u.id = m.user_id
WHERE m.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(DISTINCT m.voting_id) > 1;
GO

-- ------------------------------------------------------------
-- STEP 2 — REPAIR: head organizers (keep lowest voting id)
-- ------------------------------------------------------------
UPDATE dbo.votings
SET head_organizer_id = NULL
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY head_organizer_id ORDER BY id) AS rn
        FROM dbo.votings
        WHERE head_organizer_id IS NOT NULL
    ) ranked
    WHERE rn > 1
);
GO

-- ------------------------------------------------------------
-- STEP 3 — REPAIR: team members (keep earliest row per user)
-- ------------------------------------------------------------
DELETE FROM dbo.organizing_team_members
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) AS rn
        FROM dbo.organizing_team_members
        WHERE status = 'active'
    ) ranked
    WHERE rn > 1
);
GO

-- ------------------------------------------------------------
-- STEP 4 — CONSTRAIN: reject future head-organizer duplicates in SQL
-- (filtered index: many votings may have NULL head organizer)
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_votings_head_organizer')
    CREATE UNIQUE INDEX uq_votings_head_organizer
        ON dbo.votings(head_organizer_id)
        WHERE head_organizer_id IS NOT NULL;
GO

-- ------------------------------------------------------------
-- STEP 5 — VERIFY: both queries below must return zero rows
-- ------------------------------------------------------------
SELECT u.id AS user_id, u.name, COUNT(*) AS contest_count
FROM dbo.votings v
JOIN dbo.users u ON u.id = v.head_organizer_id
WHERE v.head_organizer_id IS NOT NULL
GROUP BY u.id, u.name
HAVING COUNT(*) > 1;

SELECT u.id AS user_id, u.name, COUNT(DISTINCT m.voting_id) AS contest_count
FROM dbo.organizing_team_members m
JOIN dbo.users u ON u.id = m.user_id
WHERE m.status = 'active'
GROUP BY u.id, u.name
HAVING COUNT(DISTINCT m.voting_id) > 1;
GO
