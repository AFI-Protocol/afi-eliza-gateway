# AFI Reactor Actions Plugin

**ElizaOS Plugin for AFI Reactor Integration**

⚠️ **DEV/DEMO ONLY** - No real trading, no emissions, simulated execution only.

---

## Overview

This plugin provides ElizaOS actions for interacting with afi-reactor's Froggy trend-pullback pipeline. It enables:

- **Alpha Scout** to submit signal drafts to the Froggy pipeline
- **Phoenix** to check AFI Reactor health and explain Froggy decisions

---

## Actions

### 1. SUBMIT_FROGGY_DRAFT (Alpha)

**Purpose**: Submit a trend-pullback signal draft to AFI Reactor's Froggy pipeline.

**Input**:
```typescript
{
  symbol: string;           // e.g. "BTC/USDT"
  timeframe: string;        // e.g. "1h", "4h"
  strategy: string;         // e.g. "froggy_trend_pullback_v1"
  direction: "long" | "short";
  market?: string;          // e.g. "spot", "perp"
  setupSummary?: string;    // Brief description of the setup
  notes?: string;           // Additional notes
  enrichmentProfile?: any;  // Optional enrichment profile
}
```

**Output**:
```typescript
{
  success: boolean;
  data?: {
    signalId: string;
    validatorDecision: {
      decision: string;       // "approve", "reject", "flag", etc.
      uwrConfidence?: number;
      reasonCodes?: string[];
    };
    execution: {
      status: string;         // "simulated", "skipped"
      type?: string;          // "buy", "sell", "hold"
      asset?: string;
      amount?: number;
      simulatedPrice?: number;
      timestamp?: string;
    };
  };
  error?: string;
}
```

**Example Usage** (in Alpha character):
```
User: "BTC/USDT 1h: Bullish pullback to 20 EMA. Swept liquidity below $67.2k, now bouncing with volume."

Alpha: [calls SUBMIT_FROGGY_DRAFT action]
       "Froggy approved! Decision: approve, Confidence: 0.78. Simulated buy: 0.1 BTC @ $67,500."
```

---

### 2. CHECK_AFI_REACTOR_HEALTH (Phoenix)

**Purpose**: Check if AFI Reactor is online and ready.

**Input**: None

**Output**:
```typescript
{
  success: boolean;
  data?: {
    status: "ok" | "error";
    message?: string;
    timestamp?: string;
  };
  error?: string;
}
```

**Example Usage** (in Phoenix character):
```
User: "Is AFI Reactor online?"

Phoenix: [calls CHECK_AFI_REACTOR_HEALTH action]
         "Yes, AFI Reactor is online and ready. The Froggy pipeline is available."
```

---

### 3. EXPLAIN_LAST_FROGGY_DECISION (Phoenix)

**Purpose**: Retrieve and explain the last Froggy pipeline decision.

**Input**: None

**Output**:
```typescript
{
  success: boolean;
  data?: FroggyPipelineResult; // Same as SUBMIT_FROGGY_DRAFT output
  error?: string;
}
```

**Example Usage** (in Phoenix character):
```
User: "What was the last signal result?"

Phoenix: [calls EXPLAIN_LAST_FROGGY_DECISION action]
         "The last signal was BTC/USDT 1h long. Froggy approved it with 78% confidence. The validator (Val Dook) found a clean trend-pullback setup with good volume confirmation. Simulated execution: buy 0.1 BTC @ $67,500."
```

---

## Configuration

### Environment Variables

- `AFI_REACTOR_BASE_URL` (optional): AFI Reactor API URL (default: `http://localhost:8080`)
- `WEBHOOK_SHARED_SECRET` (optional): Shared secret for webhook authentication

### Example `.env`

```bash
AFI_REACTOR_BASE_URL=http://localhost:8080
WEBHOOK_SHARED_SECRET=your-secret-here  # Optional
```

---

## Integration

This plugin is automatically registered in `src/index.ts`:

```typescript
import { afiReactorActionsPlugin } from "../plugins/afi-reactor-actions/index.js";

await runtime.registerPlugin(afiReactorActionsPlugin);
```

---

## Safety & Limitations

⚠️ **DEV/DEMO ONLY**:
- No real trading or order execution
- No tokenomics or emissions logic
- Simulated execution only
- No authentication (or optional shared secret only)
- No rate limiting

In production, this would require:
- Proper authentication (API keys, OAuth)
- Rate limiting and circuit breaking
- Real execution integration (with proper risk controls)
- Audit logging and compliance

---

## Dependencies

- `@elizaos/core`: ElizaOS runtime and action types
- `../../src/afiClient.js`: AFI Reactor HTTP client

---

## See Also

- [AFI Reactor HTTP Webhook Server](../../afi-reactor/docs/HTTP_WEBHOOK_SERVER.md)
- [AFI Client](../../src/afiClient.ts)
- [Alpha Character](../../src/alpha.character.ts)
- [Phoenix Character](../../src/phoenix.character.ts)

