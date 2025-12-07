import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, regarding, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const to = process.env.TO_EMAIL ?? 'pjramyanath@gmail.com';
  const subject = `Contact Form Submission - Regarding: ${regarding ?? 'General'}`;
  const text = `My Name: ${name}\nMy Email Address: ${email}\nRegarding: ${regarding ?? 'General'}\n\nMessage:\n${message}`;

    // Require SMTP configuration via environment variables
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const secure = process.env.SMTP_SECURE === 'true';

    if (!host || !user || !pass || !port) {
      return NextResponse.json(
        { success: false, error: 'SMTP not configured on server. Please set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.' },
        { status: 500 }
      );
    }

    // Optionally allow insecure/self-signed TLS for development/testing environments.
    // WARNING: setting this to true disables certificate verification and SHOULD NOT be used in production.
    const allowInsecureTls = process.env.SMTP_ALLOW_INSECURE_TLS === 'true';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure || port === 465,
      auth: { user, pass },
      tls: allowInsecureTls ? { rejectUnauthorized: false } : undefined,
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL ?? user,
      to,
      subject,
      text,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
