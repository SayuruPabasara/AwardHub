-- =============================================================================
-- AwardHub: Demo Seed Data for Award Category Management Module
-- Event 1: Grand Excellence Awards 2026
-- =============================================================================

-- Category 1: Best Young Entrepreneur (ACTIVE)
INSERT INTO categories (
    id, award_event_id, name, description, rules, nominee_eligibility, voter_eligibility,
    nomination_requirements, nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date, status,
    created_at, updated_at, created_by
) VALUES (
    1, 1, 'Best Young Entrepreneur',
    'Honoring visionary founders under age 35 who have demonstrated extraordinary business growth, resilience, and ethical leadership.',
    'Nominees must submit verified revenue reports. Self-nominations permitted.',
    'Under 35 years old on Jan 1 2026. Founder or Co-founder of a registered enterprise operating for at least 2 years.',
    'Registered platform voters with authenticated profile. One vote per verified citizen.',
    'Pitch deck, audited financial summary, business registration document, and 2 professional references.',
    '2026-03-01 00:00:00', '2026-04-15 23:59:59',
    '2026-04-20 00:00:00', '2026-05-10 23:59:59',
    '2026-05-25 18:00:00', 'ACTIVE',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Award Organizer'
);

INSERT INTO category_criteria (category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(1, 'Business Innovation & Disruption', 'Novelty of product/service, market differentiator, and business model sustainability.', 30.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Financial Performance & Growth', 'Verified revenue growth, profitability trajectory, and investment acquisition.', 25.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Social & Environmental Impact', 'Commitment to sustainability, job creation, and positive community outcomes.', 25.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Leadership & Resilience', 'Demonstrated problem solving, leadership culture, and strategic adaptability.', 20.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Category 2: Outstanding IT Professional (VOTING_OPEN)
INSERT INTO categories (
    id, award_event_id, name, description, rules, nominee_eligibility, voter_eligibility,
    nomination_requirements, nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date, status,
    created_at, updated_at, created_by
) VALUES (
    2, 1, 'Outstanding IT Professional',
    'Recognizing software engineers, architects, and cybersecurity specialists driving breakthrough technology adoption.',
    'Contributions must have occurred within the past 24 months. Peer or manager nomination required.',
    'Minimum 5 years active industry experience in software engineering, cloud architecture, or cybersecurity.',
    'All registered AwardHub users.',
    'Updated CV, portfolio links (e.g. GitHub/patents), recommendation letter from employer.',
    '2026-01-10 00:00:00', '2026-02-15 23:59:59',
    '2026-02-20 00:00:00', '2026-04-01 23:59:59',
    '2026-04-15 19:00:00', 'VOTING_OPEN',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Award Organizer'
);

INSERT INTO category_criteria (category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(2, 'Technical Architecture & Complexity', 'Depth of engineering difficulty and architectural elegance.', 35.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Open Source & Community Contribution', 'Contributions to developer community, mentorship, or tech talks.', 25.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Industry Adoption & Business Value', 'Measurable uptime, scalability, or cost reduction achieved.', 25.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Professional Ethics & Code Quality', 'Commitment to best engineering practices, testing, and security standards.', 15.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Category 3: Best Community Service (DRAFT)
INSERT INTO categories (
    id, award_event_id, name, description, rules, nominee_eligibility, voter_eligibility,
    nomination_requirements, nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date, status,
    created_at, updated_at, created_by
) VALUES (
    3, 1, 'Best Community Service',
    'Celebrating grassroots champions who have led humanitarian, educational, or environmental service projects.',
    'Non-commercial volunteer projects only. Evidence of community testimonials required.',
    'Individuals or non-profit volunteer groups active for over 1 year.',
    'Verified public voter registry.',
    'Project report, beneficiary impact numbers, photographic proof, community endorsement letters.',
    '2026-04-01 00:00:00', '2026-05-15 23:59:59',
    '2026-05-20 00:00:00', '2026-06-15 23:59:59',
    '2026-06-30 18:00:00', 'DRAFT',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Award Organizer'
);

INSERT INTO category_criteria (category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(3, 'Breadth of Community Impact', 'Number of lives positively impacted and tangible problem solved.', 40.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Project Sustainability', 'Long-term viability and volunteer mobilization.', 30.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Resource Efficiency & Transparency', 'Responsible handling of donated resources and operational transparency.', 30.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Category 4: Best Creative Artist (VOTING_CLOSED)
INSERT INTO categories (
    id, award_event_id, name, description, rules, nominee_eligibility, voter_eligibility,
    nomination_requirements, nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date, status,
    created_at, updated_at, created_by
) VALUES (
    4, 1, 'Best Creative Artist',
    'Spotlighting exceptional achievements in digital arts, visual storytelling, music, and multimedia design.',
    'All submitted works must be original and free of copyright infringements.',
    'Practicing artists, animators, designers, or creators residing nationally.',
    'Registered public voters and accredited arts guild members.',
    'Portfolio of minimum 3 flagship pieces produced in 2025/2026 with high-res media links.',
    '2025-11-01 00:00:00', '2025-12-15 23:59:59',
    '2026-01-01 00:00:00', '2026-02-15 23:59:59',
    '2026-03-01 19:00:00', 'VOTING_CLOSED',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Award Organizer'
);

INSERT INTO category_criteria (category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(4, 'Originality & Artistic Vision', 'Uniqueness of concept, emotional resonance, and distinctive style.', 35.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Technical Execution & Craftsmanship', 'Mastery of tools, composition, audio/visual fidelity.', 35.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Cultural & Contemporary Relevance', 'Message clarity and resonance with societal themes.', 30.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Category 5: Best Sports Achievement (ARCHIVED)
INSERT INTO categories (
    id, award_event_id, name, description, rules, nominee_eligibility, voter_eligibility,
    nomination_requirements, nomination_start_date, nomination_end_date,
    voting_start_date, voting_end_date, result_publication_date, status,
    created_at, updated_at, archived_at, created_by
) VALUES (
    5, 1, 'Best Sports Achievement',
    'Historical archive of the 2024-2025 athletic excellence category across varsity and national level competitions.',
    'Federation-certified athletic records required.',
    'Competed in national or inter-collegiate championships.',
    'General public voting and sports advisory board.',
    'Official tournament scorecards and coach endorsement.',
    '2024-08-01 00:00:00', '2024-09-15 23:59:59',
    '2024-09-20 00:00:00', '2024-10-15 23:59:59',
    '2024-10-30 18:00:00', 'ARCHIVED',
    '2024-08-01 09:00:00', '2024-11-01 10:00:00', '2024-11-01 10:00:00', 'Award Organizer'
);

INSERT INTO category_criteria (category_id, criterion_name, description, weight, max_score, created_at, updated_at) VALUES
(5, 'Competitive Distinction & Medals', 'Level of tournament and podium finishes secured.', 50.00, 10, '2024-08-01 09:00:00', '2024-08-01 09:00:00'),
(5, 'Sportsmanship & Fair Play', 'Integrity and discipline on and off the field.', 25.00, 10, '2024-08-01 09:00:00', '2024-08-01 09:00:00'),
(5, 'Team Leadership & Mentorship', 'Inspiration to teammates and youth athletics.', 25.00, 10, '2024-08-01 09:00:00', '2024-08-01 09:00:00');
