import { supabase } from "@/integrations/supabase/client";

export type FeedbackType = "bug" | "feature_request";

export async function submitUserFeedback(params: {
  feedbackType: FeedbackType;
  message: string;
  machineId: string;
  email?: string | null;
  userId?: string | null;
}): Promise<void> {
  const message = params.message.trim();
  if (!message) {
    throw new Error("Please enter a message before sending.");
  }
  if (message.length > 4000) {
    throw new Error("Message is too long (max 4000 characters).");
  }

  const row: Record<string, unknown> = {
    feedback_type: params.feedbackType,
    message,
    machine_id: params.machineId.trim() || "web-anonymous",
  };
  if (params.email) row.email = params.email.trim();
  if (params.userId) row.user_id = params.userId;

  const { error } = await supabase.from("user_feedback").insert(row);
  if (error) throw new Error(error.message);
}

export function feedbackMachineId(): string {
  if (typeof window === "undefined") return "web-ssr";
  const key = "sintype.feedback.machine_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `web-${Date.now()}`;
    localStorage.setItem(key, id);
  }
  return id;
}
