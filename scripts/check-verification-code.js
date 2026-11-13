import "dotenv/config";
import { getWikipediaVerificationCode } from "../helpers/gmailClient.js";

try {
  // Використовуємо час за останню добу для тестової перевірки.
  const code = await getWikipediaVerificationCode({
    after: new Date(Date.now() - 24 * 60 * 60 * 1000),
    timeout: 10000,
  });

  console.log("Wikipedia verification code retrieved successfully.");
  console.log("Code length:", code.length);
} catch (error) {
  console.error("Verification code check failed:", error.message);
  process.exitCode = 1;
}
