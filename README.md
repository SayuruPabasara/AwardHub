# AwardHub

AwardHub is a web-based awards and nominations platform. It brings nomination intake, public voting, judge evaluations, result publication, reporting, and award administration into role-specific workspaces.

## Contents

- [What it does](#what-it-does)
- [Technology](#technology)
- [Project layout](#project-layout)
- [Prerequisites](#prerequisites)
- [Run locally](#run-locally)
- [Database setup](#database-setup)
- [Demo data](#demo-data)
- [Roles and access](#roles-and-access)
- [API overview](#api-overview)
- [Tests and production build](#tests-and-production-build)
- [Configuration reference](#configuration-reference)
- [Security notes](#security-notes)

## What it does

- **Award organizers** manage award categories, nomination and voting windows, nominees, judge assignments, live vote activity, results, feedback, reports, and audit history.
- **Nominees** manage their profile, submit and track nominations, and upload supporting documents.
- **Voters** browse eligible categories, cast votes, and view their voting history and published results.
- **Judges** work through assigned nominations, score against evaluation rubrics, and review rankings and summaries.
- **Administrators and IT coordinators** access user administration, operational views, and audit information.
- **Shared workflows** include role-scoped reports, analytics, and feedback conversations.

The frontend includes public landing, login, and registration pages, followed by protected workspaces for each role. The application supports light and dark themes.

## Technology

| Area | Stack |
| --- | --- |
| Backend | Java 17, Spring Boot 3.4, Spring Web, Spring Data JPA, Spring Security, Jakarta Validation |
| Authentication | JWT bearer tokens, BCrypt password hashing |
| Databases | Microsoft SQL Server (configured target) and MySQL (optional local profile) |
| Frontend | React 18, React Router 6, Vite 5, Recharts |
| Build tools | Maven Wrapper and npm |

The frontend and backend run as separate development servers. Vite forwards `/api` requests to the backend at `http://localhost:8080`.

## Project layout

```text
.
├── src/main/java/com/awardhub/       # Spring Boot API and domain modules
├── src/main/resources/               # Database profile configuration
├── src/test/java/com/awardhub/       # Backend tests
├── awardhub-frontend/src/             # React app, pages, components, API clients
├── seed_data.sql                      # SQL Server demo dataset (destructive)
├── mvnw                               # Maven Wrapper for Linux/macOS
└── pom.xml
```

Backend code is grouped by domain, including `category`, `nomination`, `evaluation`, `profile`, `reports`, `user`, and `vote`. The frontend keeps API clients, shared components, role-specific pages, contexts, and utilities in separate folders.

## Prerequisites

- Java 17
- Node.js and npm
- A running SQL Server 2022 instance for the configured `mssql` profile, or MySQL if you set up the optional profile
- A database and database user that AwardHub can access

The Maven Wrapper is included, so a separate Maven installation is not needed. SQL Server and MySQL are not bundled with the application.

## Run locally

### 1. Configure the backend

The checked-in SQL Server profile uses the database name `awardhub2`. Ensure that database exists and that the configured database user has permission to connect and create or update the application schema. Override credentials with environment variables rather than relying on the profile's local defaults.

Set the required connection and JWT properties in the shell where you will run Spring Boot:

```bash
export SPRING_PROFILES_ACTIVE=mssql
export SPRING_DATASOURCE_URL='jdbc:sqlserver://localhost:1433;databaseName=awardhub2;encrypt=true;trustServerCertificate=true'
export SPRING_DATASOURCE_USERNAME='your_database_user'
export SPRING_DATASOURCE_PASSWORD='your_database_password'
export APP_JWT_SECRET="$(openssl rand -base64 32)"
export APP_JWT_EXPIRATION_MS=86400000
```

`app.jwt.secret` is required and must be long enough for the HMAC signing key. Keep it private and stable while tokens are in use; changing it invalidates existing tokens. `APP_JWT_EXPIRATION_MS` sets token lifetime in milliseconds (the example is 24 hours).

Start the backend from the repository root:

```bash
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080` by default.

### 2. Start the frontend

In another terminal:

```bash
cd awardhub-frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. Requests to `/api` are proxied to the backend on port 8080. If the backend runs on a different host or port, update the proxy target in `awardhub-frontend/vite.config.js`.

## Database setup

### SQL Server

`src/main/resources/application-mssql.properties` contains the SQL Server JDBC URL and dialect. Activate it with `SPRING_PROFILES_ACTIVE=mssql` as shown above. The database itself must already be created and reachable. There are no checked-in database migrations; use the schema provisioning process appropriate to your environment. For a disposable local development database, Hibernate schema updates can be enabled with:

```bash
export SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

Do not use automatic schema updates as a production migration strategy.

### MySQL (optional)

`src/main/resources/application-mysql.properties.example` is a template, not an active Spring profile file. To use it, create a local `application-mysql.properties` configuration (do not commit database credentials), set its database URL, username, and password, then run with `SPRING_PROFILES_ACTIVE=mysql`. Supply the JWT properties as in the SQL Server instructions. The MySQL configuration is provided as a local development alternative; SQL Server is the configured target.

## Demo data

`seed_data.sql` contains sample users, categories, nominations, votes, evaluations, reports, feedback, and audit records for SQL Server. All sample accounts use the password `password123`:

| Username | Role |
| --- | --- |
| `admin` | Administrator |
| `organizer_lead` | Organizer |
| `dr_miller` | Judge |
| `prof_elena` | Judge |
| `nominee_alex` | Nominee |
| `nominee_clara` | Nominee |
| `voter_sarah` | Voter |
| `voter_david` | Voter |

**Warning:** this script deletes existing rows from application tables before inserting the demo dataset. It also uses SQL Server syntax such as `GO`, `IDENTITY_INSERT`, and `SYSDATETIME()`. Run it only against a disposable SQL Server database after creating the schema; never run it against production or data you need to preserve. Replace or remove the demo accounts before exposing the application to other users.

## Roles and access

| Role | Main workspace |
| --- | --- |
| `VOTER` | Categories, voting, vote history, published results |
| `NOMINEE` | Nominations, submission, profile, nominee feed |
| `JUDGE` | Assigned worklist, scoring, rankings, summary |
| `ORGANIZER` | Dashboard, categories, nominations, judges, votes, results, reports, feedback, audit |
| `ADMIN` | Administration dashboard, users, IT, audit, health; also organizer capabilities |
| `IT_COORDINATOR` | Administration and IT coordination endpoints |

The frontend route guards provide role-specific navigation. The backend uses JWT bearer authentication and method-level role checks on protected controller methods. See [Security notes](#security-notes) before deploying or extending access-controlled endpoints.

## API overview

All backend endpoints are under `/api`. The primary route groups are:

| Route | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, current user, profile, password, account deactivation |
| `/api/categories` and role-specific category routes | Category management and role-filtered category views |
| `/api/nominations` | Nomination submission, review, approval, and rejection |
| `/api/categories/{id}/votes` | Cast or remove a vote; `/api/my/votes` lists the current user's votes |
| `/api/evaluation` | Judge worklists, evaluations, assignment, rubrics, scoring schemes, and results |
| `/api/profile/nominee` | Nominee profile and supporting documents |
| `/api/reports` and `/api/analytics` | Report generation and analytics |
| `/api/feedback` | Feedback and replies |
| `/api/admin` and `/api/itcoordinator` | IT coordinator and administrative account operations |

Authenticated API requests use the `Authorization: Bearer <token>` header. The frontend API client reads the token from browser local storage and attaches it to requests.

## Tests and production build

Run the backend test suite from the repository root:

```bash
./mvnw test
```

The current backend tests cover application context loading, vote-service behavior, and evaluation vote-count adaptation. Because the context-load test starts the Spring application and no isolated test database configuration is checked in, configure the required JWT properties and a reachable database as described in [Run locally](#run-locally) before running the full suite. The frontend package currently provides build and preview scripts but no test script.

Build the frontend for production:

```bash
cd awardhub-frontend
npm run build
npm run preview
```

The production frontend build is written to `awardhub-frontend/dist`. The repository does not currently configure Spring Boot to serve that frontend bundle; deploy or host the frontend separately and route `/api` traffic to the backend.

## Configuration reference

| Property / environment variable | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | Database profile, currently `mssql` or locally configured `mysql` |
| `SPRING_DATASOURCE_URL` | JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `APP_JWT_SECRET` | Required signing secret for JWTs |
| `APP_JWT_EXPIRATION_MS` | JWT lifetime in milliseconds |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Optional local schema behavior; use `update` only for development |
| `APP_UPLOAD_NOMINEE_DOCUMENTS_DIR` | Document upload directory; defaults to `uploads/nominee-documents` |

Nominee documents are stored on the backend filesystem by default. Persist or replace that storage when deploying to an environment where local disk is ephemeral or shared across multiple backend instances.

## Security notes

- The SQL Server profile contains local connection defaults. Override them with deployment secrets; do not treat the checked-in values as production credentials.
- Seed account passwords are public development credentials. Do not deploy seeded accounts with their sample passwords.
- Use a unique, high-entropy JWT secret and keep it out of source control and logs.
- HTTP-level Spring Security currently permits requests through the filter chain; access restrictions depend on method-level checks and service ownership checks. Review every controller endpoint and add defense-in-depth authorization before production use.
- Use HTTPS in deployed environments. The SQL Server profile's `trustServerCertificate=true` is intended for local development and should be reviewed for production TLS requirements.
- Uploaded nominee files are stored locally by default. Apply appropriate access controls, backups, retention, and malware/file-type validation for the deployment environment.