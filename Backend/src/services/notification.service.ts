import { Notification } from "../models/index.js";
import type { NotificationType } from "../models/Notification.model.js";

export interface CreateNotificationInput {
  userId?: number | null;
  businessId?: number | null;
  type?: NotificationType;
  title: string;
  message: string;
  actionTab?: string | null;
}

/**
 * Creates a persistent notification for a user without throwing if delivery fails.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    if (!input.userId) return;
    await Notification.create({
      userId: input.userId,
      businessId: input.businessId ?? null,
      type: input.type || "SYSTEM",
      title: input.title,
      message: input.message,
      isRead: false,
      actionTab: input.actionTab ?? null,
    });
  } catch (err) {
    console.error("[NOTIFICATION ERROR]:", err);
  }
}
