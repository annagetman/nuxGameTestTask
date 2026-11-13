# Wikipedia Playwright Automation

Automated UI testing of Wikipedia using Playwright and JavaScript.

The project contains an automated test that verifies whether an authenticated Wikipedia user can change their interface language. Authentication is handled by a separate Playwright setup project.

Tests can be executed locally or inside a Docker container. GitHub Actions is configured to build and run the tests using Docker and upload the Playwright HTML report as a workflow artifact.

## Tech Stack

- JavaScript (Node.js)
- Playwright
- Docker
- Docker Compose
- GitHub Actions
- dotenv
- ImapFlow
- mailparser

## Project Structure

```text
nuxGameTestTask/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── helpers/
│   └── gmailClient.js
├── pages/
│   ├── HeaderPage.js
│   ├── LoginPage.js
│   └── PreferencesPage.js
├── scripts/
│   ├── check-gmail.js
│   └── check-verification-code.js
├── tests/
│   ├── auth.setup.js
│   └── TC001_language.spec.js
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package-lock.json
├── package.json
├── playwright.config.js
└── README.md
```

## Automated Test Case

### TC001 - Authenticated user can change Wikipedia interface language

**Preconditions:**

- A valid Wikipedia user account exists.
- User credentials are configured through environment variables.
- The user is successfully authenticated by the Playwright setup project.

**Steps:**

1. Open Wikipedia as an authenticated user.
2. Navigate to user Preferences.
3. Read the currently selected interface language.
4. Select a different language:
   - Ukrainian if the current language is English.
   - English if the current language is Ukrainian.
5. Save the preferences.
6. Verify that the selected language is saved.
7. Verify that the HTML `lang` attribute matches the selected language.
8. Navigate to the Wikipedia Main Page.
9. Verify that the selected language is applied.
10. Reopen Preferences and verify that the language setting persists.

**Expected result:**

- The selected interface language is saved successfully.
- The HTML `lang` attribute matches the selected language.
- The Main Page is displayed in the selected language.
- The language preference persists after navigating between pages.

The test dynamically selects the target language based on the user's current preference.

## Authentication Setup

Authentication is implemented in a separate Playwright setup project (`tests/auth.setup.js`).

The setup:

1. Opens the Wikipedia login page.
2. Enters the configured username and password.
3. Handles additional email verification if requested by Wikipedia.
4. Retrieves the verification code from Gmail using IMAP.
5. Saves the authenticated browser state to `playwright/.auth/user.json`.

The saved authentication state is reused by the functional test, so the user does not need to log in again during the test.

## Prerequisites

- Node.js (LTS version)
- npm
- Docker Desktop (for local Docker execution)
- A Wikipedia user account
- A Gmail account configured for receiving Wikipedia verification emails (if email verification is required)

## Configuration

### 1. Clone the repository

```bash
git clone https://github.com/annagetman/nuxGameTestTask.git
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

Configure the following variables:

```env
WIKI_USERNAME=your_wikipedia_username
WIKI_PASSWORD=your_wikipedia_password
WIKI_EMAIL=your_gmail_address
WIKI_EMAIL_APP_PASSWORD=your_gmail_app_password
```

Use a dedicated Wikipedia test account and a Gmail App Password for IMAP authentication.

**Important:** Never commit the `.env` file or expose account credentials or Gmail App Passwords.

## Running Tests Locally

Run all tests:

```bash
npm test
```

Run the functional test only:

```bash
npx playwright test tests/TC001_language.spec.js
```

The Playwright setup project runs automatically before the functional test.

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
3. Validates the required GitHub Secrets.
4. Builds the Docker image.
5. Runs Playwright tests using Docker Compose.
6. Uploads the HTML report and test results as GitHub Actions artifacts.

### GitHub Secrets

The following repository secrets must be configured:

- `WIKI_USERNAME`
- `WIKI_PASSWORD`
- `WIKI_EMAIL`
- `WIKI_EMAIL_APP_PASSWORD`

Credentials are passed to the Docker container through environment variables and are not stored in the repository.

The HTML report can be downloaded from the **Artifacts** section of a completed GitHub Actions workflow run.

## Notes

- The project contains one functional automated test case.
- Authentication is handled separately by the Playwright setup project.
- The language test switches dynamically between Ukrainian and English.
- Gmail IMAP integration is used to retrieve Wikipedia email verification codes when required.
- The authenticated browser state and credentials are excluded from version control.
- Docker Compose is used to run tests in an isolated container environment.