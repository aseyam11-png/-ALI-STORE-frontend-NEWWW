# ALI STORE — Local Preview

## Frontend preview branch

`preview/alistore-local-20261005`

## Backend preview branch

`preview/alistore-backend-local-20261005`

The frontend is configured to use the same-origin `/api/v1` bridge in the browser and the local backend at `http://localhost:8080` for Next.js server-side requests.

### Frontend

PowerShell:

```powershell
cd C:\Users\MSI\Downloads\ALI-STORE-FRONTEND-RUNTIME

git fetch origin
git checkout preview/alistore-local-20261005
git reset --hard origin/preview/alistore-local-20261005

Copy-Item .env.example .env.local -Force
npm ci

npm run verify
npm run dev
```

Open `http://localhost:3000`.

### Backend

PowerShell:

```powershell
cd C:\Users\MSI\IdeaProjects\ecommerce-backend

git fetch origin
git checkout preview/alistore-backend-local-20261005
git reset --hard origin/preview/alistore-backend-local-20261005

$env:JAVA_HOME="C:\Users\MSI\.jdks\ms-21.0.11"
$env:Path="$env:JAVA_HOME\bin;$env:Path"

java -version
.\mvnw.cmd -B test
.\mvnw.cmd spring-boot:run
```

Backend runs on `http://localhost:8080` when the local application profile/database configuration is available.

## Verification gate

`npm run verify` executes:

1. ESLint
2. all Node contract tests
3. production Next.js build

The Frontend GitHub Actions job is currently failing before workflow steps execute, so GitHub has not yet provided an executable CI result for these commands. Run `npm run verify` locally before treating the preview as validated.

## Important

Do not merge either preview/fix branch to `main` solely because the branch is mergeable. The shipping-address Frontend contract depends on Backend PR #33.
