import LegalLayout, { Section } from '../components/LegalLayout'

const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" lastUpdated="August 30, 2026">
    <p>
      Vela ("we", "us") helps you make sense of confusing conversations. This policy explains what
      information we collect, how we use it, and the choices you have. By using Vela, you agree to
      the practices described here.
    </p>

    <Section title="Information we collect">
      <p><strong style={{ color: 'white' }}>Account information:</strong> your name, email address, and a hashed password (or your Google account ID if you sign in with Google). We never see or store your Google password.</p>
      <p><strong style={{ color: 'white' }}>Conversation content:</strong> the messages, screenshots, and voice input you share with Vela, so we can generate a response and show you your chat history.</p>
      <p><strong style={{ color: 'white' }}>Usage data:</strong> things like message counts, subscription status, and feature usage, used to enforce plan limits and improve the product.</p>
      <p><strong style={{ color: 'white' }}>Payment information:</strong> if you subscribe to a paid plan, billing is handled entirely by Stripe. We never see or store your full card number.</p>
    </Section>

    <Section title="How we use your information">
      <p>To provide the core service — generating responses, storing your chat history, and enforcing your plan's limits. To send account-related emails (verification codes, password resets). To improve Vela's quality and reliability. We do not sell your personal information to anyone.</p>
    </Section>

    <Section title="AI processing">
      <p>
        Your messages, screenshots, and voice input are sent to our AI provider (Groq, running large
        language models) to generate a response. We do not use your conversations to train models on
        other users' behalf, and we do not share your conversation content with anyone outside the
        service providers listed below.
      </p>
    </Section>

    <Section title="Third-party service providers">
      <p>We rely on a small number of trusted providers to run Vela, each of which processes a limited slice of your data to do its specific job:</p>
      <p>• <strong style={{ color: 'white' }}>Groq</strong> — generates AI responses from your messages<br />
      • <strong style={{ color: 'white' }}>Stripe</strong> — processes subscription payments<br />
      • <strong style={{ color: 'white' }}>Resend</strong> — delivers verification and account emails<br />
      • <strong style={{ color: 'white' }}>Cloudinary</strong> — stores and processes images you upload<br />
      • <strong style={{ color: 'white' }}>Google</strong> — powers optional "Sign in with Google"</p>
    </Section>

    <Section title="Data retention & deletion">
      <p>
        We keep your account and conversation history for as long as your account is active, so you
        can come back to past chats. You can delete individual chats at any time from the sidebar.
        To delete your entire account and associated data, contact us using the details below.
      </p>
    </Section>

    <Section title="Your rights">
      <p>
        You can access, correct, or request deletion of your personal information at any time. Reach
        out to us and we'll handle your request promptly.
      </p>
    </Section>

    <Section title="Cookies & local storage">
      <p>
        We use a single essential cookie to keep you signed in, and your browser's local storage to
        remember small preferences (like whether you've seen an onboarding tip). We don't use
        third-party advertising or tracking cookies.
      </p>
    </Section>

    <Section title="Age requirement">
      <p>Vela is intended for users aged 16 and up. We don't knowingly collect information from children under 16.</p>
    </Section>

    <Section title="Changes to this policy">
      <p>If we make material changes to this policy, we'll update the date above and, where appropriate, notify you directly.</p>
    </Section>

    <Section title="Contact us">
      <p>Questions about this policy or your data? Reach out at <a href="mailto:privacy@vela.app" style={{ color: '#c084fc' }}>privacy@vela.app</a>.</p>
    </Section>
  </LegalLayout>
)

export default PrivacyPolicy
