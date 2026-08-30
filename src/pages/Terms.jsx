import LegalLayout, { Section } from '../components/LegalLayout'

const Terms = () => (
  <LegalLayout title="Terms of Service" lastUpdated="August 30, 2026">
    <p>
      These Terms govern your use of Vela. By creating an account or using the service, you agree to
      them. If you don't agree, please don't use Vela.
    </p>

    <Section title="What Vela is">
      <p>
        Vela is an AI-powered tool that helps you think through and respond to confusing or difficult
        conversations. It offers suggestions and perspective — it does not know the full context of
        your relationships, and its responses are not guaranteed to be accurate or appropriate for
        every situation.
      </p>
      <p>
        <strong style={{ color: 'white' }}>Vela is not a substitute for professional mental health
        support, therapy, or crisis intervention.</strong> If you are in crisis or dealing with abuse,
        please contact a qualified professional or a crisis line in your area — see{' '}
        <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c084fc' }}>findahelpline.com</a>.
      </p>
    </Section>

    <Section title="Accounts">
      <p>
        You must be at least 16 years old to use Vela. You're responsible for keeping your login
        credentials secure and for all activity under your account.
      </p>
    </Section>

    <Section title="Subscriptions & billing">
      <p>
        Vela offers a Free plan and paid plans (Vela+, VelaPro) billed monthly through Stripe. You can
        cancel a paid plan at any time; you'll keep access through the end of the billing period you've
        already paid for. Prices may change with reasonable advance notice.
      </p>
    </Section>

    <Section title="Acceptable use">
      <p>
        Don't use Vela to harass, harm, or deceive others, to attempt to break or abuse the service, or
        for anything unlawful. We may suspend or terminate accounts that violate these terms.
      </p>
    </Section>

    <Section title="Your content">
      <p>
        You own the messages, screenshots, and other content you share with Vela. By using the
        service, you grant us a limited license to process that content solely to provide the service
        to you — we don't use it for anything else.
      </p>
    </Section>

    <Section title="Disclaimers">
      <p>
        Vela is provided "as is." AI-generated responses can be incomplete, inaccurate, or not suited
        to your specific situation — use your own judgment before acting on them. We don't guarantee
        the service will be uninterrupted or error-free.
      </p>
    </Section>

    <Section title="Limitation of liability">
      <p>
        To the fullest extent permitted by law, Vela and its creators are not liable for indirect,
        incidental, or consequential damages arising from your use of the service.
      </p>
    </Section>

    <Section title="Termination">
      <p>
        You can stop using Vela and delete your account at any time. We may suspend or terminate
        accounts that violate these terms or misuse the service.
      </p>
    </Section>

    <Section title="Changes to these terms">
      <p>We may update these terms from time to time. We'll update the date above when we do.</p>
    </Section>

    <Section title="Contact us">
      <p>Questions about these terms? Reach out at <a href="mailto:support@vela.app" style={{ color: '#c084fc' }}>support@vela.app</a>.</p>
    </Section>
  </LegalLayout>
)

export default Terms
