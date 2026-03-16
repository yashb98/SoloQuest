/**
 * Screen time tracking service.
 * On Android: reads usage stats via native module.
 * Fallback: manual entry or estimated from app foreground time.
 */
import { AppState, Platform } from "react-native";
import { agents } from "../api";

let appStartTime = Date.now();
let totalForegroundMs = 0;

// Track foreground time as a basic approximation
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    appStartTime = Date.now();
  } else if (state === "background" || state === "inactive") {
    totalForegroundMs += Date.now() - appStartTime;
  }
});

export function getEstimatedScreenTimeMinutes(): number {
  // Include current session if active
  const currentSession = Date.now() - appStartTime;
  return Math.round((totalForegroundMs + currentSession) / 60000);
}

export async function syncScreenTimeToAgent(
  totalMinutes?: number,
  appBreakdown?: Record<string, number>,
): Promise<void> {
  const minutes = totalMinutes ?? getEstimatedScreenTimeMinutes();
  const breakdown = appBreakdown ?? { soloquest: minutes };

  if (minutes > 0) {
    await agents.screenTimeUpdate(minutes, breakdown);
  }
}

/**
 * Manual screen time report — called from settings or daily check.
 */
export async function reportScreenTime(totalMinutes: number, breakdown: Record<string, number>) {
  return agents.screenTimeUpdate(totalMinutes, breakdown);
}
