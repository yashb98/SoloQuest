/**
 * Background task service — periodic agent syncs.
 * Runs health sync every 30min, screen time hourly, streak check after 6pm.
 */
import { Platform } from "react-native";
import { syncStepsToAgent } from "./health";
import { syncScreenTimeToAgent } from "./screen-time";
import { agents } from "../api";

let BackgroundFetch: any = null;
let TaskManager: any = null;

try {
  BackgroundFetch = require("expo-background-fetch");
  TaskManager = require("expo-task-manager");
} catch {
  // Not installed
}

const HEALTH_SYNC_TASK = "soloquest-health-sync";
const AGENT_CHECK_TASK = "soloquest-agent-check";

export async function registerBackgroundTasks() {
  if (!BackgroundFetch || !TaskManager) return;

  // Health sync — every 30 min
  TaskManager.defineTask(HEALTH_SYNC_TASK, async () => {
    try {
      await syncStepsToAgent();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  // Agent check — every 2 hours
  TaskManager.defineTask(AGENT_CHECK_TASK, async () => {
    try {
      const hour = new Date().getHours();

      // Sync screen time
      await syncScreenTimeToAgent();

      // After 6pm, check streak
      if (hour >= 18) {
        await agents.streakCheck();
      }

      // Morning plan at 7am
      if (hour >= 7 && hour < 8) {
        await agents.morningPlan();
      }

      // Evening wrap at 9pm
      if (hour >= 21 && hour < 22) {
        await agents.eveningWrap();
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  // Register tasks
  try {
    await BackgroundFetch.registerTaskAsync(HEALTH_SYNC_TASK, {
      minimumInterval: 30 * 60, // 30 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    await BackgroundFetch.registerTaskAsync(AGENT_CHECK_TASK, {
      minimumInterval: 2 * 60 * 60, // 2 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch {
    // Background tasks may not be available on all devices
  }
}
