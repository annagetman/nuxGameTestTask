import "dotenv/config";
import { ImapFlow } from "imapflow";

const client = new ImapFlow({
  host: "imap.gmail.com",
  port: 993,
  secure: true,
  auth: {
    user: process.env.WIKI_EMAIL,
    pass: process.env.WIKI_EMAIL_APP_PASSWORD?.replace(/\s/g, ""),
  },
  logger: false,
});

try {
  if (!process.env.WIKI_EMAIL || !process.env.WIKI_EMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials are missing from .env");
  }

  console.log("Gmail address configured:", Boolean(process.env.WIKI_EMAIL));
console.log(
  "App Password length:",
  process.env.WIKI_EMAIL_APP_PASSWORD?.replace(/\s/g, "").length,
);

  await client.connect();

  console.log("Gmail IMAP connection successful.");

  const lock = await client.getMailboxLock("INBOX");

  try {
    const messages = await client.search({
      from: "wiki@wikimedia.org",
      subject: "Your Wikipedia login verification code",
    });

    console.log(`Wikipedia verification emails found: ${messages.length}`);
  } finally {
    lock.release();
  }
} catch (error) {
  console.error("Gmail connection failed.");
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Server response:", error.serverResponse);
  console.error("Response code:", error.responseCode);
  console.error("Command:", error.executedCommand);
  process.exitCode = 1;
} finally {
  if (client.usable) {
    await client.logout();
  }
}
