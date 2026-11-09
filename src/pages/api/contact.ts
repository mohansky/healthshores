import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';
import { render } from '@react-email/components';
import ContactFormEmail from '../../emails/ContactFormEmail';

export const prerender = false;

// Validation schema (messages are shown to visitors next to each field)
const contactFormSchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(2, 'Please enter your full name.')
    .max(100, 'Name is too long.'),
  email: z
    .string({ error: 'Please enter your email address.' })
    .trim()
    .email('Please enter a valid email address.')
    .max(200, 'Email address is too long.'),
  phone: z.string().trim().max(30, 'Phone number is too long.').optional(),
  message: z
    .string({ error: 'Please enter a message.' })
    .trim()
    .min(10, 'Please tell us a little more (at least 10 characters).')
    .max(5000, 'Message is too long (5,000 characters max).'),
  consent: z.literal(true, {
    error: 'Please agree to the Privacy Policy so we can respond to you.',
  }),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function verifyTurnstile(secret: string, token: unknown, ip: string | null) {
  if (typeof token !== 'string' || token.length === 0) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const outcome = (await res.json()) as { success?: boolean };
  return outcome.success === true;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Secrets and config come from the Worker runtime (wrangler secrets / vars,
  // or .dev.vars in local dev), never from the build.
  const env = locals.runtime?.env ?? {};

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot: real visitors never see or fill this field.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      return json({ success: true, message: 'Thank you for contacting us! We will get back to you soon.' });
    }

    // Turnstile bot check (enforced once TURNSTILE_SECRET_KEY is configured)
    if (env.TURNSTILE_SECRET_KEY) {
      const ok = await verifyTurnstile(
        env.TURNSTILE_SECRET_KEY,
        body.turnstileToken,
        request.headers.get('CF-Connecting-IP'),
      );
      if (!ok) {
        return json(
          { success: false, message: 'We could not verify that you are human. Please try again.' },
          400,
        );
      }
    }

    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = z.flattenError(validationResult.error).fieldErrors;
      const errors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
      );
      return json({ success: false, message: 'Please check the highlighted fields.', errors }, 400);
    }

    const { name, email, phone, message } = validationResult.data;

    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return json(
        { success: false, message: 'Our contact form is temporarily unavailable. Please email us directly.' },
        500,
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const emailHtml = await render(ContactFormEmail({ name, email, phone, message }));

    const to = (env.RESEND_TO_EMAIL || 'info@healthshores.com')
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean);

    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL || 'HealthShores Website <mail@mohankumar.dev>',
      to,
      subject: `New Enquiry from ${name.replace(/[\r\n]+/g, ' ')}`,
      html: emailHtml,
      replyTo: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return json({ success: false, message: 'Failed to send your message. Please try again later.' }, 500);
    }

    return json({ success: true, message: 'Thank you for contacting us! We will get back to you within 24 hours.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return json({ success: false, message: 'An unexpected error occurred. Please try again later.' }, 500);
  }
};
