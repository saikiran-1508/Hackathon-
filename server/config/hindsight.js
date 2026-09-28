import { HindsightClient } from '@vectorize-io/hindsight-client';

// NOTE: Hindsight needs an LLM behind reflect()/entity-extraction. On the
// Hindsight Cloud dashboard this is usually a per-project "LLM provider" setting
// (paste your Groq key there) rather than something this server sends per-request.
// If the SDK instead expects the LLM key on the client/bank, add it here once you
// can see the actual dashboard fields (verify against the Hindsight docs at
// https://docs.hindsight.vectorize.io/typescript-sdk/ before assuming).
const client = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL || 'http://localhost:8888',
  apiKey: process.env.HINDSIGHT_API_KEY || undefined,
});

export default client;
