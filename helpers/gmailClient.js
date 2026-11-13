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

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        const messageIds = await client.search(
          {
            from: EMAIL_FROM,
            subject: EMAIL_SUBJECT,
          },
          { uid: true },
        );

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

            const parsedEmail = await simpleParser(message.source);

            const match = parsedEmail.text?.match(
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
        "Wikipedia verification email was not received within the timeout.",
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
