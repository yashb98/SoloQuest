/**
 * Notification listener service.
 * Captures bank/payment notifications and routes to expense agent.
 * Also handles push notifications from agent backend.
 */
import { Platform } from "react-native";
import { agents } from "../api";

let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch {
  // expo-notifications not installed
}

// Known bank/payment app package names
const EXPENSE_APPS = new Set([
  "com.google.android.apps.walletnfcrel", // Google Pay
  "com.paypal.android.p2pmobile",           // PayPal
  "com.revolut.revolut",                     // Revolut
  "com.monzo.android",                       // Monzo
  "com.starlingbank.android",                // Starling
  "com.chase.sig.android",                   // Chase
  "com.barclays.android.barclaysmobilebanking", // Barclays
]);

export async function setupNotifications() {
  if (!Notifications) return;

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  // Handle received notifications
  Notifications.addNotificationReceivedListener(handleNotification);
}

async function handleNotification(notification: any) {
  const title = notification?.request?.content?.title || "";
  const body = notification?.request?.content?.body || "";
  const data = notification?.request?.content?.data || {};

  // If it's from a bank/payment app, route to expense agent
  const appName = data?.appName || "";
  const isExpense =
    EXPENSE_APPS.has(appName) ||
    /£|€|\$|paid|payment|spent|charge|debit|transaction/i.test(`${title} ${body}`);

  if (isExpense) {
    try {
      await agents.expenseNotification(`${title}: ${body}`, appName);
    } catch {
      // Silent fail — agent will retry
    }
  }
}

/**
 * Manually forward a notification text to the expense agent.
 */
export async function forwardExpenseNotification(rawText: string, appName = "manual") {
  return agents.expenseNotification(rawText, appName);
}
