/**
 * Email notification helpers using nodemailer.
 * Configure SMTP via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'localhost',
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' }
      : undefined,
  })
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn('[email] SMTP_HOST not set — skipping email to', to)
    return
  }
  const transport = createTransport()
  await transport.sendMail({
    from:    process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@csxsearch',
    to,
    subject,
    text,
    html,
  })
}

export async function sendDirectedQuestionEmail({
  toName,
  toEmail,
  questionId,
  questionTitle,
  authorName,
  appUrl,
}: {
  toName: string
  toEmail: string
  questionId: number
  questionTitle: string
  authorName: string
  appUrl: string
}): Promise<void> {
  const url = `${appUrl}/qa/questions/${questionId}`
  await sendEmail({
    to: toEmail,
    subject: `[CSX Search] ${authorName} directed a question at you`,
    text: [
      `Hi ${toName},`,
      '',
      `${authorName} has directed a question at you:`,
      `"${questionTitle}"`,
      '',
      `View it here: ${url}`,
      '',
      'You can manage your notification preferences in Settings.',
    ].join('\n'),
    html: `
      <p>Hi ${toName},</p>
      <p><strong>${authorName}</strong> has directed a question at you:</p>
      <blockquote style="border-left:3px solid #2563eb;margin:12px 0;padding:8px 12px;color:#1b2a4a;font-style:italic">
        ${questionTitle}
      </blockquote>
      <p><a href="${url}" style="display:inline-block;padding:8px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View question</a></p>
      <p style="color:#64748b;font-size:12px">You can manage your notification preferences in <a href="${appUrl}/settings">Settings</a>.</p>
    `,
  })
}
