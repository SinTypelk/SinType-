import { useState } from "react";
import { Bug, Lightbulb, Loader2, Check, Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  feedbackMachineId,
  submitUserFeedback,
  type FeedbackType,
} from "@/lib/feedback-service";

export function SupportFeedbackForm() {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!message.trim()) return;
    setState("loading");
    setErrorMsg(null);
    try {
      await submitUserFeedback({
        feedbackType,
        message,
        machineId: feedbackMachineId(),
        email: (user?.email ?? email) || null,
        userId: user?.id ?? null,
      });
      setState("done");
      setMessage("");
    } catch (e: unknown) {
      setState("error");
      setErrorMsg((e as Error).message ?? "Could not send feedback.");
    }
  };

  return (
    <div className="space-y-5">
      <fieldset className="flex flex-col sm:flex-row gap-2">
        <label
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm cursor-pointer transition ${
            feedbackType === "bug"
              ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-foreground"
              : "border-border text-muted-foreground hover:border-white/20"
          }`}
        >
          <input
            type="radio"
            name="feedback_type"
            value="bug"
            checked={feedbackType === "bug"}
            onChange={() => setFeedbackType("bug")}
            className="sr-only"
          />
          <Bug className="w-4 h-4" /> Bug report
        </label>
        <label
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm cursor-pointer transition ${
            feedbackType === "feature_request"
              ? "border-[var(--neon-purple)] bg-[var(--neon-purple)]/10 text-foreground"
              : "border-border text-muted-foreground hover:border-white/20"
          }`}
        >
          <input
            type="radio"
            name="feedback_type"
            value="feature_request"
            checked={feedbackType === "feature_request"}
            onChange={() => setFeedbackType("feature_request")}
            className="sr-only"
          />
          <Lightbulb className="w-4 h-4" /> Feature request
        </label>
      </fieldset>

      {!user && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional, for follow-up)"
          className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border outline-none focus:border-[var(--neon-cyan)] text-sm"
        />
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          feedbackType === "bug"
            ? "What went wrong? Include steps to reproduce, Windows version, and app version if you can."
            : "Describe the feature you would like and how you would use it."
        }
        rows={6}
        className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border outline-none focus:border-[var(--neon-cyan)] text-sm resize-none"
      />

      <button
        type="button"
        onClick={submit}
        disabled={state === "loading" || !message.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
        }}
      >
        {state === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="w-4 h-4" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {state === "done" ? "Sent — thank you" : "Submit feedback"}
      </button>

      {state === "done" && (
        <p className="text-sm text-[var(--neon-cyan)]">
          We received your message. Our team reviews feedback in the admin dashboard.
        </p>
      )}
      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
    </div>
  );
}
