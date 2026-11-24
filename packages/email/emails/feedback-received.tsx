import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { FEEDBACKER_LOGO } from '@repo/utils';

interface FeedbackReceivedEmailProps {
  workspaceName: string;
  comment: string;
  rating?: number;
  dashboardUrl: string;
}

const MAX_RATING = 5;

const toStars = (rating: number) => {
  const filled = Math.min(MAX_RATING, Math.max(0, Math.round(rating)));
  return '★'.repeat(filled) + '☆'.repeat(MAX_RATING - filled);
};

export const FeedbackReceivedEmail = ({
  workspaceName,
  comment,
  rating,
  dashboardUrl,
}: FeedbackReceivedEmailProps) => (
  <Html>
    <Head>
      <title>New feedback for {workspaceName}</title>
    </Head>
    <Preview>New feedback received for {workspaceName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={FEEDBACKER_LOGO}
          width="42"
          height="42"
          alt="Feedbacker"
          style={logo}
        />
        <Heading style={heading}>New feedback for {workspaceName}</Heading>
        {rating != null &&
          Number.isFinite(rating) &&
          rating >= 1 &&
          rating <= MAX_RATING && <Text style={stars}>{toStars(rating)}</Text>}
        <Text style={paragraph}>{comment}</Text>
        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            View in dashboard
          </Button>
        </Section>
      </Container>
    </Body>
  </Html>
);

FeedbackReceivedEmail.PreviewProps = {
  workspaceName: 'Acme',
  comment: 'Love the product, but the export button is hard to find.',
  rating: 4,
  dashboardUrl: 'https://www.google.com',
} as FeedbackReceivedEmailProps;

export default FeedbackReceivedEmail;

const logo = {
  borderRadius: 21,
  width: 42,
  height: 42,
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const stars = {
  margin: '0 0 10px',
  fontSize: '22px',
  letterSpacing: '2px',
  color: '#f59e0b',
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
};
