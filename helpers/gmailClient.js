import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const EMAIL_FROM = "wiki@wikimedia.org";
const EMAIL_SUBJECT = "Your Wikipedia login verification code";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getWikipediaVerificationCode({ after, timeout = 90000 }) {
  const user = process.env.WIKI_EMAIL;
  const password = process.env.WIKI_EMAIL_APP_PASSWORD;

  if (!user || !password) {
    throw new Error("WIKI_EMAIL or WIKI_EMAIL_APP_PASSWORD is missing.");
  }

  if (!(after instanceof Date) || Number.isNaN(after.getTime())) {
    throw new Error("A valid login start time must be provided.");
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user,
      pass: password.replace(/\s/g, ""),
    },
    logger: false,
  });

  const diagnostics = {
    messagesFound: 0,
    messagesAfterLogin: 0,
    matchingSubjects: 0,
    messagesWithText: 0,
  };

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        // Search by sender first. Validate subject and date below.
        const messageIds = await client.search(
          { from: EMAIL_FROM },
          { uid: true },
        );

        diagnostics.messagesFound = messageIds?.length ?? 0;

        if (messageIds?.length) {
          for (const id of [...messageIds].reverse()) {
            const message = await client.fetchOne(
              id,
              {
                source: true,
                internalDate: true,
              },
              { uid: true },
            );

            if (!message?.source || !message.internalDate) {
              continue;
            }

            if (new Date(message.internalDate) < after) {
              continue;
            }

            diagnostics.messagesAfterLogin++;

            const parsedEmail = await simpleParser(message.source);

            const subject = parsedEmail.subject?.trim() ?? "";

            if (!subject.toLowerCase().includes(EMAIL_SUBJECT.toLowerCase())) {
              continue;
            }

            diagnostics.matchingSubjects++;

            const emailText = parsedEmail.text ?? "";

            if (emailText) {
              diagnostics.messagesWithText++;
            }

            const match = emailText.match(
              /Your verification code is:\s*(\d{6})/i,
            );

            if (match) {
              return match[1];
            }
          }
        }

        await delay(5000);
      }

      throw new Error(
        `Wikipedia verification email was not processed within ${timeout} ms. ` +
          `Diagnostics: ${JSON.stringify(diagnostics)}`,
      );
    } finally {
      lock.release();
    }
  } finally {
    if (client.usable) {
      await client.logout();
    }
  }
}
