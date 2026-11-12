# Wikipedia Playwright Automation

Automated UI tests for Wikipedia using Playwright and JavaScript.

The project covers user authentication and changing the Wikipedia interface language. Tests are executed locally or inside a Docker container. GitHub Actions is configured to run tests automatically and publish the HTML report as a workflow artifact.

## Tech Stack

- JavaScript (Node.js)
- Playwright
- Docker
- Docker Compose
- GitHub Actions
- dotenv

## Project Structure

```text
nuxGameTestTask/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── pages/
│   ├── HeaderPage.js
│   ├── LoginPage.js
│   └── PreferencesPage.js
├── tests/
│   ├── language.spec.js
│   └── login.spec.js
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package-lock.json
├── package.json
├── playwright.config.js
└── README
```

## Test Scenarios

### TC001 - Login with valid credentials

**Preconditions:**
- A valid Wikipedia user account exists.
- Username and password are configured in environment variables.

**Steps:**
1. Open the Wikipedia login page.
2. Enter a valid username and password.
3. Click the Login button.

**Expected result:**
- The user is successfully authenticated.
- The user is redirected to the Wikipedia Main Page.

### TC002 - Authenticated user can change Wikipedia interface language

**Preconditions:**
- A valid Wikipedia user account exists.
- Username and password are configured in environment variables.

**Steps:**
1. Open the Wikipedia login page.
2. Log in using valid credentials.
3. Navigate to user Preferences.
4. Read the currently selected interface language.
5. Select a different language:
   - Ukrainian if the current language is English.
   - English if the current language is Ukrainian.
6. Save the preferences.
7. Verify that the selected language is saved.
8. Verify the HTML `lang` attribute.
9. Navigate to the Wikipedia Main Page.

**Expected result:**
- The selected interface language is saved successfully.
- The HTML `lang` attribute matches the selected language.
- The Main Page heading is displayed in the selected language:
  - `Головна сторінка` for Ukrainian.
  - `Main Page` for English.

The test dynamically selects the language based on the current user preference.

## Prerequisites

- Node.js (LTS version)
- npm
- Docker Desktop (for local Docker execution)
- A Wikipedia user account

## Configuration

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd nuxGameTestTask
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browser

```bash
npx playwright install chromium
```

### 4. Configure environment variables

Create a `.env` file in the project root based on `.env.example`.

```env
WIKI_USERNAME=your_wikipedia_username
WIKI_PASSWORD=your_wikipedia_password
```

Use a dedicated Wikipedia test account.

**Important:** Never commit the `.env` file or expose account credentials.

## Running Tests Locally

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npx playwright test tests/login.spec.js
npx playwright test tests/language.spec.js
```

## Running Tests with Docker

Build and run tests using Docker Compose:

```bash
docker compose run --build --rm tests
```

The test report and test results are saved to the host machine through Docker volume mounts.

## HTML Report

Playwright HTML reports are generated in:

```text
playwright-report/
```

Open the report locally:

```bash
npm run report
```

Test execution artifacts are stored in:

```text
test-results/
```

## GitHub Actions

The project includes a GitHub Actions workflow:

```text
.github/workflows/playwright.yml
```

The workflow:

1. Runs on pushes and pull requests targeting the `master` branch.
2. Can also be triggered manually using `workflow_dispatch`.
3. Builds the Docker image.
4. Runs Playwright tests using Docker Compose.
5. Uploads the HTML report and test results as GitHub Actions artifacts.

### GitHub Secrets

The following repository secrets must be configured:

- `WIKI_USERNAME`
- `WIKI_PASSWORD`

Credentials are passed to the Docker container through environment variables and are not stored in the repository.

The HTML report can be downloaded from the **Artifacts** section of a completed GitHub Actions workflow run.

## Notes

- Tests use a dedicated Wikipedia account.
- The language test switches between Ukrainian and English dynamically.
- The selected language is saved in the user's Wikipedia preferences.
- Credentials are stored in environment variables and excluded from version control.
- Docker Compose is used to run tests in an isolated container environment.