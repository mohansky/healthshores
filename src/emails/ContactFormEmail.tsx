import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactFormEmail = ({
  name,
  email,
  phone,
  message,
}: ContactFormEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Form Submission</Heading>

          <Section style={section}>
            <Text style={label}>Name:</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>
          </Section>

          {phone && (
            <Section style={section}>
              <Text style={label}>Phone:</Text>
              <Text style={value}>{phone}</Text>
            </Section>
          )}

          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from the HealthShores contact form
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const section = {
  padding: '0 40px',
  marginBottom: '24px',
};

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '4px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  margin: '0',
};

const messageStyle = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  whiteSpace: 'pre-wrap' as const,
};

const footer = {
  padding: '0 40px',
  marginTop: '32px',
  borderTop: '1px solid #eaeaea',
  paddingTop: '24px',
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '16px',
};
