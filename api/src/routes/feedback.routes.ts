import type { FastifyInstance } from 'fastify';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface FeedbackRequest {
  name: string;
  email: string;
  message: string;
}

interface FeedbackResponse {
  success: boolean;
  error?: string;
}

const sesClient = new SESClient({});

export async function feedbackRoutes(server: FastifyInstance): Promise<void> {
  /**
   * POST /feedback
   * Submit feedback via email
   */
  server.post<{ Body: FeedbackRequest; Reply: FeedbackResponse }>(
    '/feedback',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'message'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email', maxLength: 254 },
            message: { type: 'string', minLength: 10, maxLength: 5000 },
          },
        },
      },
    },
    async (request): Promise<FeedbackResponse> => {
      const feedbackEmail = process.env['FEEDBACK_EMAIL'];

      if (!feedbackEmail) {
        server.log.error('FEEDBACK_EMAIL environment variable not configured');
        return {
          success: false,
          error: 'Feedback is not configured. Please try again later.',
        };
      }

      const { name, email, message } = request.body;

      try {
        const command = new SendEmailCommand({
          Source: feedbackEmail,
          Destination: {
            ToAddresses: [feedbackEmail],
          },
          ReplyToAddresses: [email],
          Message: {
            Subject: {
              Data: `[STAR Bond Feedback] Message from ${name}`,
              Charset: 'UTF-8',
            },
            Body: {
              Text: {
                Data: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                Charset: 'UTF-8',
              },
              Html: {
                Data: `
                  <h2>Feedback from Chiefs STAR Bond Analysis Tool</h2>
                  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                  <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
                  <hr />
                  <p><strong>Message:</strong></p>
                  <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
                `,
                Charset: 'UTF-8',
              },
            },
          },
        });

        await sesClient.send(command);

        server.log.info({ from: email, name }, 'Feedback email sent successfully');

        return { success: true };
      } catch (error) {
        server.log.error({ error, email, name }, 'Failed to send feedback email');
        return {
          success: false,
          error: 'Failed to send feedback. Please try again later.',
        };
      }
    }
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
