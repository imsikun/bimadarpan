// lib/insights.ts
// All plain-English interpretations live here.
// Change copy here without touching any component.

export const PENETRATION_INSIGHTS = {
  excellent: "Better covered than most Indian states. Still, 1 in 3 people here have no cover.",
  good:      "Most people here lack insurance. A medical emergency could wipe out family savings.",
  low:       "8 out of 10 people here are completely unprotected.",
  critical:  "Fewer than 1 in 10 people have any cover — one of India's most critical gaps.",
}

export const SETTLEMENT_INSIGHTS = {
  excellent: "Claims are mostly honoured here. Still check your policy exclusions carefully.",
  good:      "About 1 in 5 claims faces rejection or delay in this state.",
  low:       "Roughly 1 in 4 claims gets rejected or delayed here.",
  critical:  "More than 1 in 3 claims faces rejection — high risk for policyholders.",
}

export function getPenetrationInsight(pct: number): string {
  if (pct > 25)  return PENETRATION_INSIGHTS.excellent
  if (pct > 15)  return PENETRATION_INSIGHTS.good
  if (pct > 10)  return PENETRATION_INSIGHTS.low
  return PENETRATION_INSIGHTS.critical
}

export function getSettlementInsight(pct: number): string {
  if (pct > 85)  return SETTLEMENT_INSIGHTS.excellent
  if (pct > 75)  return SETTLEMENT_INSIGHTS.good
  if (pct > 65)  return SETTLEMENT_INSIGHTS.low
  return SETTLEMENT_INSIGHTS.critical
}

export const PREMIUM_INSIGHTS = {
  high:    "One of India's largest insurance markets by premium volume.",
  medium:  "Mid-sized market with room to grow as awareness increases.",
  low:     "Small premium base — large untapped opportunity here.",
  minimal: "Very early-stage market. Most risk here goes uninsured.",
}

export function getPremiumInsight(cr: number): string {
  if (cr > 50000) return PREMIUM_INSIGHTS.high
  if (cr > 10000) return PREMIUM_INSIGHTS.medium
  if (cr > 2000)  return PREMIUM_INSIGHTS.low
  return PREMIUM_INSIGHTS.minimal
}
