// AI features (NexusGPT, podcast/image generation, meeting insights, knowledge
// base tools) depend on Firebase Cloud Functions that require active billing.
// In this public showcase that backend is offline, so AI actions short-circuit
// here with a clear message instead of attempting a network call that fails.
export const AI_FEATURES_AVAILABLE = false;

export const AI_UNAVAILABLE_MESSAGE =
  "AI features aren't available in this demo (backend not active).";
