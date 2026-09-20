# AwardHub — Web-based Voting System for Award Nominations

**Module**: SE2030 – Software Engineering (Year 2, Semester 1 - 2026)  
**Institution**: Sri Lanka Institute of Information Technology (SLIIT)  
**Group ID**: `2026-Y2-S1-MLB-B10G2-06`

---

## 📖 Overview

AwardHub is a comprehensive, centralized web-based voting and award management system designed to digitalize and streamline the complete award lifecycle—from category setup and nomination submission to blind judging, public voting, automated hybrid score calculation, tie resolution, winner determination, analytics, and feedback.

Built with **React.js**, **Tailwind CSS**, and **Lucide Icons**, this frontend features a minimal, high-clarity user interface that comprehensively implements the **5 stakeholder roles** and **6 core functional modules** detailed in the project proposal.

---

## 👥 5 Stakeholder Roles & Access Controls

The application includes an **Interactive Role Switcher Bar** at the top of the interface, allowing users, examiners, and evaluators to switch seamlessly between all 5 roles in 1 click:

1. **Award Organizer (`usr-org-1`: Prof. Kalinga Silva)**
   - Oversees the complete 5-stage award pipeline: *Setup $\to$ Nominate $\to$ Review & Judge $\to$ Vote $\to$ Results*.
   - Creates and manages award categories, schedules (nomination, evaluation, voting), and hybrid scoring weights ($W_{judge} + W_{public} = 100\%$).
   - Reviews applicant dossiers with attached PDFs, verifies eligibility requirements, and approves or rejects submissions with official reviewer remarks.
   - Assigns evaluators to categories and defines multi-criteria scoring rubrics.
   - Inspects aggregated standings, breaks ties using the tie-breaker protocol, and publishes official winners to the public leaderboard.
   - Views analytical insights and manages stakeholder feedback.

2. **Nominee (`usr-nom-1`: Kavindu Perera - Student ID: IT25101477)**
   - Manages personal profile, academic credentials, research experience, and honors.
   - Maintains a centralized **Supporting Document Vault** (CVs, whitepapers, recommendation letters).
   - Verifies category eligibility automatically.
   - Submits award nominations with project titles, summaries, impact pitches, demo links, and attached evidence.
   - Saves drafts and tracks application progress across 4 stages (*Draft/Submitted $\to$ Organizer Review $\to$ Qualified for Voting $\to$ Public Ballots*).
   - Can retract/withdraw nominations prior to deadlines.

3. **Judge / Evaluator (`usr-judge-1`: Dr. Anoma Wijesinghe)**
   - Evaluates assigned category candidates independently.
   - Features a toggleable **Blind Review Mode** that masks candidate identities, universities, and personal photos with anonymous identifiers (e.g. `BLIND-CAND-7491`) to eliminate unconscious bias.
   - Multi-criteria rubric scoring sliders (1.0 to 10.0) with real-time weighted score calculation.
   - Documents qualitative evaluation notes and recommendations.

4. **Public Voter (`usr-voter-1`: Dinuka Fernando - NIC: 200129485732)**
   - Explores active voting categories and approved candidate innovation dossiers.
   - **Voter Verification**: Enforces Sri Lankan National Identity Card (NIC) validation (12-digit digital NIC or 9-digit + V/X legacy format) and email to prevent duplicate voting.
   - Single-vote enforcement per category.
   - **My Votes View**: Inspects cast ballots, allows updating candidate selection, or retracting/withdrawing votes before the deadline.
   - **Public Winners Showcase**: Celebratory laureate hall once results are published by the organizer.

5. **System Administrator (`usr-admin-1`: Dr. Sanath Jayawardena)**
   - Stakeholder account management (view all users, create users, reassign roles between Admin, Organizer, Nominee, Judge, and Voter).
   - **Immutable Audit Trails**: Filterable and searchable audit logging module tracking every action with `Timestamp`, `Actor`, `Role`, `Module`, `Action`, `Target ID`, and `Details`.
   - Security controls: Maintenance mode toggle and database backup snapshot export.

---

## ⚙️ 6 Core Functional Modules

| Module | Proposal Section | Lead Member | Implemented Capabilities |
| :--- | :--- | :--- | :--- |
| **1. Award Category Management** | Section 6.1 / 7.1 | Ahamed M.J.S. (IT25101477) | Category CRUD, status lifecycle, eligibility criteria, schedule windows, hybrid weighting sliders (e.g. 60/40). |
| **2. Nomination Management** | Section 6.2 / 7.2 | Tharuneth M.A.D. (IT25103253) | Submission wizard, document attachment, draft saving, organizer verification queue, approve/reject with notes, withdrawal. |
| **3. Nominee Profile Management** | Section 6.3 / 7.3 | Eragoda W.M.S.P. (IT25102287) | Profile bio, student ID, experience timeline, achievement tracker, document vault file manager, eligibility validation. |
| **4. Voting Management** | Section 6.4 / 7.4 | Fernando W.M.M.P.D. (IT25102733) | Candidate ballot showcase, NIC voter verification modal, duplicate vote prevention, vote update & withdrawal before deadline. |
| **5. Evaluation & Results** | Section 6.5 / 7.5 | Rukshan P.K.R (IT25100737) | Blind review mode, rubric criteria scoring (1-10 sliders), automated hybrid formula ($FinalScore = W_j \cdot Judge + W_p \cdot Public$), tie resolution modal, winner publication. |
| **6. Reporting & Analytics** | Section 6.6 / 7.6 | Hayas M.L.M (IT25100153) | Turnout metrics, category participation bars, CSV report exporter, feedback submission modal, organizer feedback inbox. |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 💾 Reactive Shared State Engine

All state updates (categories, nominations, votes, judge scores, audit logs, and feedback) are managed by `AwardHubContext` and synchronized with `localStorage`. Changes in one role immediately propagate across all other roles in real time!
