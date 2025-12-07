# AFI Signal Outbox (AFIScout Drafts)

AFIScout is an ElizaOS character that turns natural-language trade ideas into **draft** AFI-ready signal payloads. The payload shape is `AfiScoutSignalDraft` (see `src/afiscout/types/afi-scout-signal.ts`). This repo only produces and logs drafts; it does **not** push signals into AFI, perform PoI/PoInsight/UWR, novelty, emissions, or tokenomics.

## Draft Payload Shape (`AfiScoutSignalDraft`)
- `source: "afiscout"` — literal tag
- `symbol: string` — e.g., `"BTCUSDT"`
- `market: string` — e.g., `"crypto"`, `"equities"`, `"fx"`
- `timeframe: string` — e.g., `"1h"`, `"4h"`, `"1d"`
- `action: "long" | "short" | "flat"`
- `thesis: string` — brief explanation of the idea
- `createdAt: string` — ISO timestamp
- `regimeTag?: string`
- `tags?: string[]`
- `meta?: Record<string, unknown>`

### Example Draft (AFIScout output)
```json
{
  "source": "afiscout",
  "symbol": "BTCUSDT",
  "market": "crypto",
  "timeframe": "4h",
  "action": "long",
  "thesis": "I'm thinking about a long BTCUSDT swing trade on the 4h timeframe because ETF inflows look strong.",
  "createdAt": "2025-12-02T22:18:37.282Z",
  "tags": ["swing", "etf-inflows", "momentum"]
}
```
This is **example output** from AFIScout; it is not the canonical AFI signal schema.

## Where This Could Go Next (Conceptual)
- Future AFI-facing services (e.g., an `afi-signal-outbox` or ingestion endpoint in `afi-reactor` / `afi-infra`) could receive `AfiScoutSignalDraft` JSON over HTTP/queue/file.
- That service would normalize/enrich the draft into AFI’s canonical signal schema and hand it to the AFI pipeline for scoring/validation.
- No API route or wire format is defined here; this is a conceptual sketch. Canonical schemas/specs live in other AFI repos (e.g., `afi-core`, `afi-reactor`, `afi-docs`).

## Scope & Boundaries
- Draft-only, logging-only in this repo.
- No backend writes, no validation/scoring/tokenomics, no vault or emissions.
- AFIScout smoke script (`npm run afiscout:smoke`) runs locally with an in-memory runtime and logs a single draft JSON.
