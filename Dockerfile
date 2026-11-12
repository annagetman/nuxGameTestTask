FROM mcr.microsoft.com/playwright:v1.65.0-noble

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy project files
COPY . .

# Run Playwright tests
CMD ["npx", "playwright", "test"]