import { defineRailway, github, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const velaSituationshipAiTranlator = service("vela-situationship-ai-tranlator", {
    source: github("DeniTutic/vela-situationship-ai-tranlator", { checkSuites: false, rootDirectory: "/server" }),
    replicas: { "sfo": 1 },
    deploy: { sleepApplication: true },
    env: { CLIENT_URL: preserve(), GOOGLE_CLIENT_ID: preserve(), GOOGLE_CLIENT_SECRET: preserve(), GOOGLE_REDIRECT_URI: preserve(), GROQ_API_KEY: preserve(), JWT_SECRET: preserve(), MONGO_URI: preserve(), NODE_ENV: preserve(), RESEND_API_KEY: preserve(), STRIPE_PLUS_PRICE_ID: preserve(), STRIPE_PRO_PRICE_ID: preserve(), STRIPE_SECRET_KEY: preserve(), STRIPE_WEBHOOK_SECRET: preserve() },
  });

  return project("efficient-passion", {
    resources: [velaSituationshipAiTranlator],
  });
});
