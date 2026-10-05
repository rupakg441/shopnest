import nodemailer from 'nodemailer';

let transport;

const getTransport = () => {
  if (transport) return transport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP_HOST and SMTP_FROM are required to send account emails.');
    }
    return null;
  }

  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transport;
};

export const sendAccountEmail = async ({ to, subject, text, actionUrl }) => {
  const mailTransport = getTransport();
  if (!mailTransport) {
    console.info(`[Development email] ${subject} for ${to}: ${actionUrl}`);
    return;
  }

  await mailTransport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: `${text}\n\n${actionUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>${text}</p><p><a href="${actionUrl}">Continue to ShopNest</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
};
