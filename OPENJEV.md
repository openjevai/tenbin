# OpenJEV Support

This fork adds optional [OpenJEV](https://openjev.sh) support alongside the original
TypeSafe API. OpenJEV is a free community gateway to the same Jev model built by
[TypeSafe](https://typesafe.ai). TypeSafe remains the default; anyone with a TypeSafe
key sees zero behaviour change.

## What was added

| File | Change |
|---|---|
| `tenbin/src/config.ts` | Added `baseUrl` and `provider` to `Config`; provider selection logic in `loadConfig` (TypeSafe default, OpenJEV opt-in) |
| `tenbin/src/client.ts` | Pass `baseURL` to the `TypeSafeClient` SDK constructor; provider-aware error messages in `describeError` and constructor; added `provider` and `baseUrl` getters to `TypeSafeGateway` |
| `tenbin/src/tools/evaluate.ts` | Pass provider context to `describeError`; updated model description |
| `tenbin/src/tools/evaluate_many.ts` | Pass provider context to `describeError` |
| `tenbin/src/tools/rank.ts` | Pass provider context to `describeError` |
| `tenbin/src/tools/walk_taxonomy.ts` | Pass provider context to `describeError` |
| `tenbin/src/tools/misc.ts` | Pass provider context to `describeError` |
| `skills/tenbin/scripts/evaluate.py` | Added `OPENJEV_BASE_URL`, provider selection in `main()`, HTTP 503 to retry statuses, provider-aware error messages |
| `skills/tenbin/scripts/evaluate_test.py` | Updated test assertions to match new error messages; deterministic env setup |
| `skills/tenbin/templates/questions.py` | Added OpenJEV comment noting model `openjev` for the gateway |
| `skills/tenbin/templates/questions.ts` | Added OpenJEV comment noting model `openjev` for the gateway |
| `skills/tenbin/reference/sdk.md` | Added OpenJEV note |
| `skills/tenbin/SKILL.md` | Mention `OPENJEV_API_KEY` alongside `TYPESAFE_API_KEY` |
| `README.md` | OpenJEV note after intro; env vars in configuration table and env example |
| `tenbin/README.md` | OpenJEV note after intro; env vars in configuration table; install example |

## Provider selection rule

1. **Explicit choice wins:** `JEV_PROVIDER=openjev` (or `typesafe`) overrides everything.
2. **TypeSafe if its key is set** (unchanged default): when `TYPESAFE_API_KEY` is present and no explicit provider is chosen, TypeSafe is used exactly as before.
3. **OpenJEV if only `OPENJEV_API_KEY` is set:** when `TYPESAFE_API_KEY` is absent and `OPENJEV_API_KEY` is present, OpenJEV is used automatically.

| | TypeSafe (default) | OpenJEV |
|---|---|---|
| Endpoint | `https://api.typesafe.ai/v1/systemone` | `https://api.openjev.sh/v1/systemone` |
| Model | `jev-latest` | `openjev` |
| Key env | `TYPESAFE_API_KEY` | `OPENJEV_API_KEY` |
| Overload status | 529 | 503 (also retried) |

## How to configure

Set `OPENJEV_API_KEY` in your environment or `~/.config/tenbin/env`:

```sh
OPENJEV_API_KEY=...               # from https://openjev.sh/dashboard
```

Or explicitly choose the provider:

```sh
JEV_PROVIDER=openjev
OPENJEV_API_KEY=...
```

The MCP server and `scripts/evaluate.py` both auto-detect the provider. TypeSafe users
do not need to change anything.

## How it was verified

A live `POST https://api.openjev.sh/v1/systemone` request was sent with model `openjev`,
state `ping`, and one noul question. It returned HTTP 200 with a valid answer.

## Upstream

Original project: https://github.com/simota/tenbin by @simota
