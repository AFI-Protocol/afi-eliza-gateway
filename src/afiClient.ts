/**
 * AFI Client - Dev/Demo Only
 *
 * Purpose: Minimal HTTP client for calling afi-reactor's Froggy pipeline.
 *
 * ⚠️ WARNING: This is DEV/DEMO ONLY. It assumes:
 * - afi-reactor is running locally on port 8080 (or AFI_REACTOR_BASE_URL env var)
 * - The /api/webhooks/tradingview endpoint exists
 * - No authentication (or optional shared secret via WEBHOOK_SHARED_SECRET)
 * - No rate limiting
 * - Simulated execution only (no real trading)
 * - No tokenomics or emissions logic
 *
 * In production, this would:
 * - Use proper authentication (API keys, OAuth, etc.)
 * - Handle retries and circuit breaking
 * - Support multiple environments (dev, staging, prod)
 * - Include telemetry and logging
 *
 * Part of: afi-eliza-gateway integration with afi-reactor
 */

/**
 * TradingView-like signal draft.
 * This is the shape that Alpha Scout agents send to the Froggy pipeline.
 * Matches the TradingViewAlertPayload interface from afi-reactor.
 */
export interface TradingViewLikeDraft {
  symbol: string;
  timeframe: string;
  strategy: string;
  direction: "long" | "short";
  market?: string;
  setupSummary?: string;
  notes?: string;
  enrichmentProfile?: any; // Optional enrichment profile (keep loose for now)
}

/**
 * Froggy pipeline result.
 * This is the shape returned by the Froggy pipeline after full processing.
 * Matches the FroggyPipelineResult interface from afi-reactor.
 */
export interface FroggyPipelineResult {
  signalId: string;
  validatorDecision: {
    decision: string;
    uwrConfidence?: number;
    reasonCodes?: string[];
    [key: string]: any;
  } | null;
  execution: {
    status: string;
    type?: string;
    asset?: string;
    amount?: number;
    simulatedPrice?: number;
    timestamp?: string;
    [key: string]: any;
  } | null;
  meta?: Record<string, any>;
  [key: string]: any;
}

/**
 * Health check response from AFI Reactor.
 */
export interface HealthCheckResponse {
  status: "ok" | "error";
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Get AFI Reactor base URL from environment or use default.
 */
export function getAfiReactorBaseUrl(): string {
  return process.env.AFI_REACTOR_BASE_URL || "http://localhost:8080";
}

/**
 * Run Froggy trend_pullback_v1 pipeline on a signal draft.
 *
 * This sends the draft to afi-reactor's Froggy pipeline endpoint,
 * which processes it through:
 * 1. Alpha Scout Ingest
 * 2. Signal Structurer (Pixel Rick)
 * 3. Froggy Enrichment Adapter
 * 4. Froggy Analyst (trend_pullback_v1)
 * 5. Validator Decision Evaluator (Val Dook)
 * 6. Execution Agent Sim
 *
 * @param draft - TradingView-like signal draft
 * @returns Froggy pipeline result with validator decision and execution status
 *
 * @throws Error if the request fails or returns non-2xx status
 */
export async function runFroggyTrendPullback(
  draft: TradingViewLikeDraft
): Promise<FroggyPipelineResult> {
  const baseUrl = getAfiReactorBaseUrl();
  const endpoint = `${baseUrl}/api/webhooks/tradingview`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Optional: Add shared secret authentication if configured
    const sharedSecret = process.env.WEBHOOK_SHARED_SECRET;
    if (sharedSecret) {
      headers["x-webhook-secret"] = sharedSecret;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AFI Reactor returned ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();
    return result as FroggyPipelineResult;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to run Froggy pipeline: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Health check for AFI Reactor.
 *
 * @returns Health check response with status and message
 *
 * @throws Error if the request fails
 */
export async function checkAfiReactorHealth(): Promise<HealthCheckResponse> {
  const baseUrl = getAfiReactorBaseUrl();
  const endpoint = `${baseUrl}/health`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `Health check failed with status ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      status: "ok",
      ...result,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "error",
        message: `Health check failed: ${error.message}`,
      };
    }
    return {
      status: "error",
      message: "Health check failed with unknown error",
    };
  }
}

