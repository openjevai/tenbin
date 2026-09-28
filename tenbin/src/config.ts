/** Input-token price for jev-1.13.0 (docs: /models). Output tokens are free. */
export const PRICE_PER_MTOK_USD = 0.042;

/** API limits for jev-1.13 (docs: /models for the token limits, /primitives/choice for 255 options, /primitives/score for 2–10 levels). */
export const API_LIMITS = {
  totalTokens: 64_000,
  stateAndLongestQuestionTokens: 32_000,
  maxChoiceOptions: 255,
  minScoreLevels: 2,
  maxScoreLevels: 10,
} as const;

const TYPESAFE_BASE_URL = "https://api.typesafe.ai";
const OPENJEV_BASE_URL = "https://api.openjev.sh";
const TYPESAFE_DEFAULT_MODEL = "jev-latest";
const OPENJEV_DEFAULT_MODEL = "openjev";

export type Provider = "typesafe" | "openjev";

export interface Config {
  apiKey: string | undefined;
  defaultModel: string;
  baseUrl: string;
  provider: Provider;
  maxTokensPerCall: number;
  sessionTokenBudget: number;
  concurrency: number;
  maxStates: number;
  pricePerMtokUsd: number;
}

function intEnv(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return n;
}

/**
 * Provider selection (TypeSafe stays the default):
 * 1. Explicit `JEV_PROVIDER` wins (`typesafe` or `openjev`).
 * 2. Otherwise, if `TYPESAFE_API_KEY` is set → TypeSafe (unchanged default).
 * 3. Otherwise, if only `OPENJEV_API_KEY` is set → OpenJEV.
 * Anyone with a TypeSafe key sees zero behaviour change.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const explicit = env.JEV_PROVIDER?.trim().toLowerCase();
  const typesafeKey = env.TYPESAFE_API_KEY?.trim() || undefined;
  const openjevKey = env.OPENJEV_API_KEY?.trim() || undefined;

  const useOpenjev =
    explicit === "openjev" ||
    (explicit !== "typesafe" && !typesafeKey && !!openjevKey);

  const provider: Provider = useOpenjev ? "openjev" : "typesafe";
  const apiKey = useOpenjev ? openjevKey : typesafeKey;
  const baseUrl = useOpenjev
    ? OPENJEV_BASE_URL
    : (env.TYPESAFE_BASE_URL?.trim() || TYPESAFE_BASE_URL);
  const defaultModel = useOpenjev
    ? OPENJEV_DEFAULT_MODEL
    : (env.TYPESAFE_DEFAULT_MODEL?.trim() || TYPESAFE_DEFAULT_MODEL);

  return {
    apiKey,
    defaultModel,
    baseUrl,
    provider,
    // Never above what the API accepts, whatever the environment says.
    maxTokensPerCall: Math.min(intEnv(env, "TENBIN_MAX_TOKENS_PER_CALL", 60_000), API_LIMITS.totalTokens),
    sessionTokenBudget: intEnv(env, "TENBIN_SESSION_TOKEN_BUDGET", 20_000_000),
    concurrency: intEnv(env, "TENBIN_CONCURRENCY", 8),
    maxStates: intEnv(env, "TENBIN_MAX_STATES", 500),
    pricePerMtokUsd: PRICE_PER_MTOK_USD,
  };
}

