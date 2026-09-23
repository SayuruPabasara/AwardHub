# Fernando W.M.M.P.D. — IT25102733

**Role:** Developer — **Voting Management** (AwardHub, group 2026-Y2-S1-MLB-B10G2-06)

## Sprint ownership (from B10G2_2026-Y2-S1-MLB-B10G2-06_Scrum.pdf)

| Task | PBI | Story | Sprint | PBI Priority |
|---|---|---|---|---|
| T-01.5 | PBI-19 | Role-controlled user account creation (IT Coordinator) | 1 | High |
| T-02.7 | PBI-05 | Voter-facing list of approved nominees | 2 | High |
| T-02.8 | PBI-06 | Vote casting with NIC validation + duplicate-vote blocking | 2 | High |
| T-03.9 | PBI-20 | Secure credential reset for locked-out users | 3 | Medium |
| T-03.10 | PBI-07 | Vote update / withdraw before the deadline | 3 | Medium |
| T-03.11 | — | Sprint 3 integration / regression checks | 3 | — |
| T-04.8 | PBI-08 | Vote confirmation after casting | 4 | Low |
| T-04.13 | PBI-09 | Voter feedback submission | 4 | Low |

## Folder layout

```
Fernando_WMMPD_IT25102733/
└── backend/                          # Only the backend files for my sprint
    ├── pom.xml                       # Spring Boot 3.5.5, Java 17, JWT, JPA, MSSQL
    └── src/main/
        ├── java/com/awardhub/
        │   ├── controller/
        │   │   ├── VoteController.java          # T-02.8, T-03.10, T-04.8: cast/withdraw votes, list my votes (confirmation)
        │   │   ├── FeedbackController.java      # T-04.13: voter feedback submission + "my feedback" list
        │   │   ├── ItCoordinatorController.java # T-01.5, T-03.9: account creation w/ roles, credential reset, deactivation
        │   │   └── AuthController.java          # T-01.5 supporting: register/login, profile, password change (PBI-20 self-service path)
        │   ├── service/
        │   │   ├── VoteService.java             # T-02.8, T-03.10: NIC check, window check, unique vote, withdraw, audit, suspicious flags
        │   │   ├── FeedbackService.java         # T-04.13: feedback validation & persistence
        │   │   ├── AdminService.java            # T-01.5: createUser with role validation, ban/status changes
        │   │   ├── AuthService.java             # T-03.9 supporting: changePassword (self-service credential reset)
        │   │   └── AuditService.java            # Audit trail + suspicious-activity flagging for all my operations
        │   ├── entity/
        │   │   ├── Vote.java                    # One vote per user per voting (unique constraint)
        │   │   ├── Voting.java                  # Category + nomination/voting windows (eligibility rules)
        │   │   ├── Feedback.java                # Voter feedback record
        │   │   └── User.java                    # Roles, NIC, status/ban locking
        │   ├── repository/
        │   │   ├── VoteRepository.java          # Duplicate-vote enforcement queries
        │   │   ├── VotingRepository.java        # Voting/category lookups
        │   │   ├── FeedbackRepository.java      # Feedback persistence
        │   │   └── UserRepository.java          # Account lookups for auth/account management
        │   ├── security/                        # JWT auth chain shared by all endpoints
        │   └── dto/DTOs.java                    # Request/response records (VoteRequest, FeedbackRequest, ...)
        └── resources/application.yml            # DB connection, JWT secret, CORS config
```

## Note on scope

These are the backend files that implement **my sprint tasks**. Some are shared
infrastructure the sprint features depend on (security/JWT, audit service, DTOs,
application.yml, pom.xml) — included so the feature code is understandable and
runnable in context. The full project (frontend, complete backend, database
scripts) lives in the group repository.
.
