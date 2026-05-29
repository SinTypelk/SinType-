import { useState } from "react";
import { Bug, Lightbulb, X, Send, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  feedbackMachineId,
  submitUserFeedback,
  type FeedbackType,
} from "@/lib/feedback-service";
import { NotificationsPanel } from "@/components/NotificationsPanel";

export function FeedbackFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="mt-20 pb-24 sm:pb-8 opacity-60 hover:opacity-100 transition">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="font-display tracking-[0.2em]">
            © {new Date().getFullYear()} SinType.lk
          </p>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <NotificationsPanel />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition"
            >
              <Bug className="w-3.5 h-3.5" /> Feedback
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {open && <FeedbackModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
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
      setTimeout(onClose, 1200);
    } catch (e: unknown) {
      setState("error");
      setErrorMsg((e as Error).message ?? "Could not send feedback.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{
        background: "color-mix(in oklab, black 60%, transparent)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 p-6"
        style={{
          background: "color-mix(in oklab, var(--card) 90%, transparent)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Send feedback</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Choose a category, then describe your bug or feature idea. We read every submission.
        </p>

        <fieldset className="flex gap-2 mb-4">
          <label
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm cursor-pointer transition ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm cursor-pointer transition ${
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

        <div className="space-y-3">
          {!user && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email (optional)"
              className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border outline-none focus:border-[var(--neon-cyan)] text-sm"
            />
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              feedbackType === "bug"
                ? "What went wrong? Steps to reproduce help a lot…"
                : "Describe the feature you would like…"
            }
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border outline-none focus:border-[var(--neon-cyan)] text-sm resize-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={state === "loading" || !message.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground disabled:opacity-50"
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
            {state === "done" ? "Sent — thank you" : "Send feedback"}
          </button>
          {errorMsg && <p className="text-sm text-destructive text-center">{errorMsg}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
