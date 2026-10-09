# ALI STORE — Monorepo

ALI STORE is a merchant-owned B2C retail store. Supplier systems are internal sourcing and fulfillment integrations; they are not customer-facing seller storefronts.

## Repository layout

- `src/` — Next.js / React storefront.
- `backend/` — Spring Boot REST API, Java 17, Maven Wrapper, Flyway migrations, and backend tests.
- `.github/workflows/backend.yml` — backend CI, run from `backend/`.
- `.github/workflows/frontend.yml` and the other quality workflows — frontend checks.

## Local development

Run the API and storefront in separate terminals.

### Backend (Java 17)

PowerShell:
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE = "dev"
.\mvnw.cmd spring-boot:run
```

macOS/Linux:
```bash
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

The API listens on port `8080`. Configure database and authentication settings through environment variables; never commit real secrets. See `backend/src/main/resources/application.yml` and the profile-specific configuration files.

Run backend tests:

```bash
cd backend
./mvnw -B test
```

On Windows PowerShell use `.\mvnw.cmd -B test`.

### Frontend (Node.js)

From the repository root:

```bash
npm ci
npm run dev
```

The Next.js development server runs on port `3000`. The frontend rewrites `/api/v1/*`, `/oauth2/*`, and `/login/oauth2/*` to the backend origin. Set `BACKEND_INTERNAL_URL=http://localhost:8080` in the local frontend environment when needed.

## Deployment boundary

Combining the code in one Git repository does not make the Java API run on Vercel automatically. Vercel can deploy the Next.js frontend; the Spring Boot backend still needs a Java-capable runtime or a container deployment. Configure `BACKEND_INTERNAL_URL` to point to the deployed API, and keep production credentials in the deployment platform's secret store.

## CI

The backend workflow runs Maven tests and the PostgreSQL concurrency suite from `backend/` when backend code or its workflow changes. A successful workflow run is required evidence before merging; migration itself does not imply tests or deployment have passed.
