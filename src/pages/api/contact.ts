import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';
import { render } from '@react-email/components';
import ContactFormEmail from '../../emails/ContactFormEmail';

export const prerender = false;

// Validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { name, email, phone, message } = validationResult.data;

    // Initialize Resend
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Render email template
    const emailHtml = await render(
      ContactFormEmail({
        name,
        email,
        phone,
        message,
      })
    );

    // Send email
    const { data, error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'mail@mohankumar.dev',
      to: import.meta.env.RESEND_TO_EMAIL || 'mail@mohankumar.dev',
      subject: `New Enqiry from ${name}`,
      html: emailHtml,
      replyTo: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to send email. Please try again later.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
