/**
 * Health/Step tracking service.
 * Uses expo-sensors Pedometer on supported devices.
 * Falls back to manual entry.
 */
import { Platform } from "react-native";
import { agents } from "../api";

let Pedometer: any = null;
try {
  Pedometer = require("expo-sensors").Pedometer;
} catch {
  // expo-sensors not installed
}

let subscription: any = null;

export async function isStepTrackingAvailable(): Promise<boolean> {
  if (!Pedometer) return false;
  try {
    const result = await Pedometer.isAvailableAsync();
    return result;
  } catch {
    return false;
  }
}

export async function getTodaySteps(): Promise<number> {
  if (!Pedometer) return 0;
  try {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const result = await Pedometer.getStepCountAsync(start, end);
    return result?.steps || 0;
  } catch {
    return 0;
  }
}

export function watchSteps(callback: (steps: number) => void) {
  if (!Pedometer) return () => {};
  subscription = Pedometer.watchStepCount((result: { steps: number }) => {
    callback(result.steps);
  });
  return () => {
    if (subscription) {
      subscription.remove();
      subscription = null;
    }
  };
}

export async function syncStepsToAgent(sleepHours = 0): Promise<void> {
  const steps = await getTodaySteps();
  if (steps > 0) {
    await agents.healthSync(steps, sleepHours);
  }
}
