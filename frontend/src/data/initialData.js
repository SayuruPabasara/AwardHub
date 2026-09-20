export const initialEvents = [
  {
    id: 'evt-2026',
    name: 'SLIIT National Technology & Leadership Awards 2026',
    edition: 'Annual Awards 2026',
    theme: 'Recognizing Innovation, Excellence & Societal Impact',
    currentStage: 'Vote', // 'Setup' | 'Nominate' | 'Review & Judge' | 'Vote' | 'Results'
    organizer: 'Awards Steering Committee',
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    status: 'Active'
  }
];

export const initialCategories = [
  {
    id: 'cat-1',
    eventId: 'evt-2026',
    code: 'INNOV-26',
    name: 'Best Innovative Software Solution',
    description: 'Recognizes exceptional software engineering, architectural ingenuity, and novel problem solving.',
    eligibility: 'Must be an original software platform with working live demo and documentation.',
    status: 'Voting Active', // 'Draft' | 'Nomination Open' | 'Evaluation' | 'Voting Active' | 'Completed' | 'Archived'
    evaluationMode: 'hybrid', // 'judge_only' | 'public_only' | 'hybrid'
    weights: { judge: 60, public: 40 },
    schedules: {
      nominationStart: '2026-08-01',
      nominationEnd: '2026-08-25',
      evaluationStart: '2026-08-26',
      evaluationEnd: '2026-09-20',
      votingStart: '2026-09-01',
      votingEnd: '2026-09-30'
    },
    assignedJudges: ['usr-judge-1', 'usr-judge-2'],
    rubric: [
      { id: 'crit-1', name: 'Innovation & Originality', maxScore: 10, weight: 30, description: 'Novelty of approach and uniqueness of technological design.' },
      { id: 'crit-2', name: 'Technical Depth & Architecture', maxScore: 10, weight: 30, description: 'Code quality, system stability, performance, and security.' },
      { id: 'crit-3', name: 'Real-world Societal Impact', maxScore: 10, weight: 25, description: 'Demonstrated value and address of tangible practical needs.' },
      { id: 'crit-4', name: 'Presentation & Documentation', maxScore: 10, weight: 15, description: 'Clarity of documentation, architecture diagrams, and pitch.' }
    ],
    isPublished: false,
    winnerId: null
  },
  {
    id: 'cat-2',
    eventId: 'evt-2026',
    code: 'AI-RES-26',
    name: 'Outstanding AI & Data Science Research',
    description: 'Celebrates breakthroughs in artificial intelligence, deep learning models, and empirical research publications.',
    eligibility: 'Published research or pre-print with reproducible experiments and validated data benchmark.',
    status: 'Evaluation',
    evaluationMode: 'judge_only',
    weights: { judge: 100, public: 0 },
    schedules: {
      nominationStart: '2026-08-01',
      nominationEnd: '2026-08-28',
      evaluationStart: '2026-08-29',
      evaluationEnd: '2026-09-25',
      votingStart: '2026-09-26',
      votingEnd: '2026-10-05'
    },
    assignedJudges: ['usr-judge-1'],
    rubric: [
      { id: 'crit-201', name: 'Methodological Rigor', maxScore: 10, weight: 35, description: 'Soundness of mathematical grounding and experimental framework.' },
      { id: 'crit-202', name: 'Scientific Novelty', maxScore: 10, weight: 35, description: 'Significance beyond state-of-the-art baselines.' },
      { id: 'crit-203', name: 'Reproducibility & Code Quality', maxScore: 10, weight: 30, description: 'Clean repositories, benchmark transparency, and dataset availability.' }
    ],
    isPublished: false,
    winnerId: null
  },
  {
    id: 'cat-3',
    eventId: 'evt-2026',
    code: 'COMM-26',
    name: 'Community Impact & Digital Inclusion',
    description: 'Honoring projects that democratize technology access, education, and empower marginalized communities.',
    eligibility: 'Initiatives operating for at least 3 months with verified beneficiary outcomes.',
    status: 'Voting Active',
    evaluationMode: 'hybrid',
    weights: { judge: 40, public: 60 },
    schedules: {
      nominationStart: '2026-08-05',
      nominationEnd: '2026-08-25',
      evaluationStart: '2026-08-26',
      evaluationEnd: '2026-09-18',
      votingStart: '2026-09-01',
      votingEnd: '2026-09-28'
    },
    assignedJudges: ['usr-judge-2'],
    rubric: [
      { id: 'crit-301', name: 'Scale of Community Reach', maxScore: 10, weight: 40, description: 'Number of people directly aided and geographic diversity.' },
      { id: 'crit-302', name: 'Sustainability Model', maxScore: 10, weight: 30, description: 'Longevity and independence from one-off external funding.' },
      { id: 'crit-303', name: 'Stakeholder Empowerment', maxScore: 10, weight: 30, description: 'Skills transfer and positive community independence.' }
    ],
    isPublished: false,
    winnerId: null
  },
  {
    id: 'cat-4',
    eventId: 'evt-2026',
    code: 'LEAD-26',
    name: 'Emerging Young Tech Leader of the Year',
    description: 'Recognizing undergraduate pioneers demonstrating exemplary leadership, vision, and team mentorship.',
    eligibility: 'Current undergraduate or graduate student under 28 years with verifiable mentorship track record.',
    status: 'Completed',
    evaluationMode: 'hybrid',
    weights: { judge: 50, public: 50 },
    schedules: {
      nominationStart: '2026-07-01',
      nominationEnd: '2026-07-25',
      evaluationStart: '2026-07-26',
      evaluationEnd: '2026-08-15',
      votingStart: '2026-08-16',
      votingEnd: '2026-08-30'
    },
    assignedJudges: ['usr-judge-1', 'usr-judge-2'],
    rubric: [
      { id: 'crit-401', name: 'Leadership & Mentorship Impact', maxScore: 10, weight: 40, description: 'Demonstrated influence in guiding teams and peers.' },
      { id: 'crit-402', name: 'Vision & Strategic Thinking', maxScore: 10, weight: 30, description: 'Ability to foresee problems and execute resilient solutions.' },
      { id: 'crit-403', name: 'Integrity & Ethics', maxScore: 10, weight: 30, description: 'Commitment to high ethical standards and collaborative culture.' }
    ],
    isPublished: true,
    winnerId: 'nom-6' // Methmi Samarakoon
  }
];

export const initialUsers = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Sanath Jayawardena',
    email: 'admin.awards@sliit.lk',
    role: 'admin',
    department: 'Faculty of Computing / IT Administration',
    nic: '197510204910',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-org-1',
    name: 'Prof. Kalinga Silva',
    email: 'kalinga.s@sliit.lk',
    role: 'organizer',
    department: 'Awards Steering & Governance Committee',
    nic: '198129481723',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-nom-1',
    name: 'Kavindu Perera',
    email: 'it25101477@my.sliit.lk',
    role: 'nominee',
    department: 'Software Engineering (Year 2)',
    studentId: 'IT25101477',
    nic: '200119482019',
    phone: '+94 77 123 4567',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Undergraduate Software Engineering researcher specializing in embedded machine learning and computer vision on low-resource edge devices.',
    achievements: [
      '1st Place - SLIIT Hackathon 2025',
      'Dean’s List for Academic Excellence (GPA 3.92)',
      'Published in IEEE International Student Conference 2025'
    ],
    experience: [
      'Lead AI Engineer, AgriTech Open Source Project (2025 - Present)',
      'Undergraduate Peer Tutor in Data Structures (2024 - 2025)'
    ],
    documents: [
      { id: 'doc-1', name: 'Curriculum_Vitae_Kavindu.pdf', size: '1.4 MB', uploadedAt: '2026-08-05' },
      { id: 'doc-2', name: 'Recommendation_Letter_DrWickramasinghe.pdf', size: '640 KB', uploadedAt: '2026-08-06' },
      { id: 'doc-3', name: 'Technical_Whitepaper_BioScan.pdf', size: '3.8 MB', uploadedAt: '2026-08-08' },
      { id: 'doc-4', name: 'IEEE_Conference_Acceptance.pdf', size: '420 KB', uploadedAt: '2026-08-10' }
    ]
  },
  {
    id: 'usr-judge-1',
    name: 'Dr. Anoma Wijesinghe',
    email: 'anoma.w@industrylabs.io',
    role: 'judge',
    department: 'Chief Architect, Industry Digital Labs',
    nic: '198420194812',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    expertise: ['Cloud Architecture', 'Distributed Systems', 'Applied ML']
  },
  {
    id: 'usr-judge-2',
    name: 'Mr. Roshan Wickramaratne',
    email: 'roshan.w@innovatesrilanka.org',
    role: 'judge',
    department: 'Director of Tech Venture Incubation',
    nic: '197930192841',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    expertise: ['Product Innovation', 'Startup Scaling', 'Social Tech']
  },
  {
    id: 'usr-voter-1',
    name: 'Dinuka Fernando',
    email: 'dinuka.f@student.sliit.lk',
    role: 'voter',
    department: 'Information Technology',
    nic: '200129485732',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  }
];

export const initialNominations = [
  {
    id: 'nom-1',
    anonymousId: 'BLIND-CAND-7491',
    categoryId: 'cat-1',
    categoryName: 'Best Innovative Software Solution',
    nomineeId: 'usr-nom-1',
    nomineeName: 'Kavindu Perera',
    institution: 'SLIIT Faculty of Computing',
    title: 'BioScan: Low-Cost Edge AI for Real-time Crop Disease Detection',
    summary: 'A sub-100 millisecond neural network inference engine running on low-power IoT microcontrollers, enabling rural farmers to identify 42 plant pathology symptoms offline without cellular connectivity.',
    detailedPitch: 'Traditional smart agriculture relies on high-bandwidth cloud APIs that are unreachable in remote agrarian regions. BioScan quantizes vision transformer weights to INT8 and achieves 96.4% recall directly on a $12 ESP32-S3 module with an onboard camera. Validated across 14 test farms in Nuwara Eliya and Dambulla.',
    liveDemoUrl: 'https://github.com/awardhub-demo/bioscan-edge',
    status: 'Approved', // 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Withdrawn'
    submittedAt: '2026-08-12T10:30:00Z',
    reviewedAt: '2026-08-27T14:15:00Z',
    reviewerNotes: 'Exceptional offline edge-AI deployment and concrete empirical metrics. Fully meets all category requirements.',
    documentsAttached: [
      { name: 'Technical_Whitepaper_BioScan.pdf', size: '3.8 MB' },
      { name: 'Recommendation_Letter_DrWickramasinghe.pdf', size: '640 KB' }
    ],
    stats: {
      publicVotes: 142
    }
  },
  {
    id: 'nom-2',
    anonymousId: 'BLIND-CAND-8102',
    categoryId: 'cat-1',
    categoryName: 'Best Innovative Software Solution',
    nomineeId: 'usr-nom-dilshan',
    nomineeName: 'Dilshan Alwis',
    institution: 'SLIIT Faculty of Computing',
    title: 'SafeTransit: Decentralized Crowdsourced Commuter Safety Network',
    summary: 'A privacy-preserving mobile transit application using peer-to-peer mesh telemetry to detect route anomalies, unsafe stops, and emergency alerts without sharing persistent GPS traces.',
    detailedPitch: 'Built on zero-knowledge cryptographic proofs, SafeTransit empowers public bus and train passengers to flag safety hazards and panic alerts. Over 3,500 daily active rides tracked anonymously in the Western Province pilot.',
    liveDemoUrl: 'https://github.com/awardhub-demo/safetransit-network',
    status: 'Approved',
    submittedAt: '2026-08-15T11:45:00Z',
    reviewedAt: '2026-08-28T09:20:00Z',
    reviewerNotes: 'Solid security architecture and high user engagement numbers in Colombo metropolitan area.',
    documentsAttached: [
      { name: 'SafeTransit_Security_Audit.pdf', size: '2.1 MB' }
    ],
    stats: {
      publicVotes: 188
    }
  },
  {
    id: 'nom-3',
    anonymousId: 'BLIND-CAND-9234',
    categoryId: 'cat-1',
    categoryName: 'Best Innovative Software Solution',
    nomineeId: 'usr-nom-ravindu',
    nomineeName: 'Ravindu Bandara',
    institution: 'Faculty of Engineering',
    title: 'EcoCharge: Dynamic Load Balancing Protocol for Renewable Microgrids',
    summary: 'An intelligent load shedding and EV battery charging coordinator that redistributes solar peak surges to reduce localized grid brownouts.',
    detailedPitch: 'EcoCharge algorithms balance variable domestic photovoltaic outputs with commercial EV fleet charge demands, flattening substation peak strains by 31.8% in mathematical simulations.',
    liveDemoUrl: 'https://github.com/awardhub-demo/ecocharge-microgrid',
    status: 'Approved',
    submittedAt: '2026-08-18T16:00:00Z',
    reviewedAt: '2026-08-28T16:40:00Z',
    reviewerNotes: 'Highly promising clean energy initiative with viable engineering metrics.',
    documentsAttached: [
      { name: 'EcoCharge_Simulation_Results.pdf', size: '4.5 MB' }
    ],
    stats: {
      publicVotes: 96
    }
  },
  {
    id: 'nom-4',
    anonymousId: 'BLIND-CAND-3310',
    categoryId: 'cat-2',
    categoryName: 'Outstanding AI & Data Science Research',
    nomineeId: 'usr-nom-suren',
    nomineeName: 'Dr. Suren Mendis',
    institution: 'Computational Biology Laboratory',
    title: 'Self-Supervised Contrastive Learning for Histopathology Diagnostics',
    summary: 'A foundational self-supervised vision model trained on 1.2M whole-slide biopsy images, outperforming supervised ResNet baselines on rare cancer subtype classification.',
    detailedPitch: 'Addresses the acute shortage of labeled oncology datasets in developing regions. Model features yield +12% higher AUROC on uncurated clinical samples from the National Cancer Institute.',
    liveDemoUrl: 'https://github.com/awardhub-demo/pathology-contrastive',
    status: 'Approved',
    submittedAt: '2026-08-20T08:15:00Z',
    reviewedAt: '2026-08-30T10:00:00Z',
    reviewerNotes: 'Rigorous peer-reviewed methodology and high clinical significance.',
    documentsAttached: [
      { name: 'Histopathology_Paper_Draft.pdf', size: '5.2 MB' }
    ],
    stats: {
      publicVotes: 0
    }
  },
  {
    id: 'nom-5',
    anonymousId: 'BLIND-CAND-4451',
    categoryId: 'cat-1',
    categoryName: 'Best Innovative Software Solution',
    nomineeId: 'usr-nom-hashini',
    nomineeName: 'Hashini Jayasuriya',
    institution: 'Faculty of Computing',
    title: 'AgriSense: Automated Drone Multi-spectral Canopy Analyzer',
    summary: 'Automated NDVI crop stress analysis pipeline generating geo-referenced prescription maps for fertilizer reduction.',
    detailedPitch: 'Flight planning tool and edge pipeline that processes multi-spectral imagery to deliver nitrogen application maps in 5 minutes.',
    liveDemoUrl: 'https://github.com/awardhub-demo/agrisense-drone',
    status: 'Under Review', // Waiting for Organizer approval
    submittedAt: '2026-08-24T19:30:00Z',
    reviewedAt: null,
    reviewerNotes: null,
    documentsAttached: [
      { name: 'Canopy_Stress_Algorithm.pdf', size: '1.9 MB' }
    ],
    stats: {
      publicVotes: 0
    }
  },
  {
    id: 'nom-6',
    anonymousId: 'BLIND-CAND-1100',
    categoryId: 'cat-4',
    categoryName: 'Emerging Young Tech Leader of the Year',
    nomineeId: 'usr-nom-methmi',
    nomineeName: 'Methmi Samarakoon',
    institution: 'SLIIT Computing Women in Tech',
    title: 'Empowering 1,200 Girls Across Rural Districts in Coding & Robotics',
    summary: 'Founded CodeForward SL, providing weekend hands-on STEM workshops, mentorship pairings, and laptop distribution across 18 rural schools.',
    detailedPitch: 'Through grassroots university chapters and community sponsorships, trained over 1,200 students with 84% continuing into computer science streams.',
    liveDemoUrl: 'https://codeforward-sl.org',
    status: 'Approved',
    submittedAt: '2026-07-15T14:00:00Z',
    reviewedAt: '2026-07-28T11:00:00Z',
    reviewerNotes: 'Exemplary leadership, deep social impact, and sustainable community architecture.',
    documentsAttached: [
      { name: 'Impact_Report_CodeForward.pdf', size: '3.1 MB' }
    ],
    stats: {
      publicVotes: 320
    }
  }
];

export const initialJudgeScores = [
  {
    id: 'eval-1',
    categoryId: 'cat-1',
    nominationId: 'nom-1', // BioScan
    judgeId: 'usr-judge-1',
    judgeName: 'Dr. Anoma Wijesinghe',
    isBlind: true,
    criteriaScores: {
      'crit-1': 9.5, // Innovation (30%)
      'crit-2': 9.0, // Technical Depth (30%)
      'crit-3': 9.2, // Impact (25%)
      'crit-4': 8.8  // Presentation (15%)
    },
    weightedScore: 9.16, // Calculated
    feedback: 'Fascinating implementation of INT8 quantization on ESP32-S3. The empirical field trials in Nuwara Eliya show genuine viability.',
    submittedAt: '2026-09-03T14:30:00Z'
  },
  {
    id: 'eval-2',
    categoryId: 'cat-1',
    nominationId: 'nom-1', // BioScan
    judgeId: 'usr-judge-2',
    judgeName: 'Mr. Roshan Wickramaratne',
    isBlind: false,
    criteriaScores: {
      'crit-1': 9.0,
      'crit-2': 8.8,
      'crit-3': 9.5,
      'crit-4': 9.0
    },
    weightedScore: 9.07,
    feedback: 'Very scalable product vision. The farmer adoption hurdles have been carefully considered and addressed with offline operation.',
    submittedAt: '2026-09-04T10:15:00Z'
  },
  {
    id: 'eval-3',
    categoryId: 'cat-1',
    nominationId: 'nom-2', // SafeTransit
    judgeId: 'usr-judge-1',
    judgeName: 'Dr. Anoma Wijesinghe',
    isBlind: true,
    criteriaScores: {
      'crit-1': 8.8,
      'crit-2': 8.5,
      'crit-3': 9.0,
      'crit-4': 8.7
    },
    weightedScore: 8.75,
    feedback: 'Zero-knowledge proofs applied to mass transit tracking is clever and timely given privacy concerns.',
    submittedAt: '2026-09-05T16:00:00Z'
  },
  {
    id: 'eval-4',
    categoryId: 'cat-1',
    nominationId: 'nom-3', // EcoCharge
    judgeId: 'usr-judge-1',
    judgeName: 'Dr. Anoma Wijesinghe',
    isBlind: true,
    criteriaScores: {
      'crit-1': 8.2,
      'crit-2': 8.9,
      'crit-3': 8.0,
      'crit-4': 8.5
    },
    weightedScore: 8.41,
    feedback: 'Strong simulation modeling. Needs broader physical hardware testing with utility transformers.',
    submittedAt: '2026-09-06T11:20:00Z'
  }
];

export const initialVotes = [
  {
    id: 'vote-1',
    categoryId: 'cat-1',
    nomineeId: 'nom-1',
    voterNIC: '200129485732',
    voterEmail: 'dinuka.f@student.sliit.lk',
    castAt: '2026-09-05T09:12:00Z',
    ipAddress: '192.248.32.14'
  },
  {
    id: 'vote-2',
    categoryId: 'cat-1',
    nomineeId: 'nom-2',
    voterNIC: '199918294812',
    voterEmail: 'sanjaya.k@gmail.com',
    castAt: '2026-09-06T12:04:00Z',
    ipAddress: '112.134.88.29'
  }
];

export const initialAuditLogs = [
  {
    id: 'log-1',
    timestamp: '2026-09-01T08:00:00Z',
    actor: 'Prof. Kalinga Silva',
    role: 'Award Organizer',
    module: 'Award Category Management',
    action: 'STATUS_CHANGE',
    targetId: 'cat-1',
    details: 'Changed category status from "Evaluation" to "Voting Active"'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-03T14:30:00Z',
    actor: 'Dr. Anoma Wijesinghe',
    role: 'Judge',
    module: 'Evaluation & Scoring',
    action: 'SCORE_SUBMISSION',
    targetId: 'nom-1',
    details: 'Submitted blind rubric evaluation for candidate BLIND-CAND-7491 (Weighted score: 9.16)'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-05T09:12:00Z',
    actor: 'Dinuka Fernando',
    role: 'Public Voter',
    module: 'Voting Management',
    action: 'VOTE_CAST',
    targetId: 'cat-1',
    details: 'Cast authenticated vote using NIC 200129485732 for BioScan'
  },
  {
    id: 'log-4',
    timestamp: '2026-08-27T14:15:00Z',
    actor: 'Prof. Kalinga Silva',
    role: 'Award Organizer',
    module: 'Nomination Management',
    action: 'NOMINATION_APPROVED',
    targetId: 'nom-1',
    details: 'Approved nomination BioScan submitted by Kavindu Perera after eligibility check.'
  },
  {
    id: 'log-5',
    timestamp: '2026-08-30T16:00:00Z',
    actor: 'Dr. Sanath Jayawardena',
    role: 'System Administrator',
    module: 'User Account Management',
    action: 'ROLE_ASSIGNMENT',
    targetId: 'usr-judge-2',
    details: 'Assigned Judge privileges to Mr. Roshan Wickramaratne for 2026 cycle.'
  }
];

export const initialFeedback = [
  {
    id: 'fb-1',
    submittedBy: 'Dinuka Fernando',
    userRole: 'Public Voter',
    rating: 5,
    category: 'Voting Experience',
    comment: 'The NIC validation process is very straightforward and fast. It feels much more fair and secure than old Google Forms!',
    submittedAt: '2026-09-05T09:15:00Z',
    status: 'Reviewed'
  },
  {
    id: 'fb-2',
    submittedBy: 'Kavindu Perera',
    userRole: 'Nominee',
    rating: 5,
    category: 'Nomination Portal',
    comment: 'Great feature being able to save drafts and upload whitepapers directly to the nominee document vault.',
    submittedAt: '2026-08-14T18:20:00Z',
    status: 'Reviewed'
  },
  {
    id: 'fb-3',
    submittedBy: 'Dr. Anoma Wijesinghe',
    userRole: 'Judge',
    rating: 4,
    category: 'Evaluation System',
    comment: 'The blind review mode helps eliminate unconscious bias completely. Would love to see an integrated PDF viewer next!',
    submittedAt: '2026-09-04T12:00:00Z',
    status: 'New'
  }
];
