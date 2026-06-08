import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageSquareQuote, Send, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchReviews,
  submitReview,
  type ReviewRow,
} from "@/lib/reviews-service";
import { LoginModal } from "@/components/LoginModal";
import { Textarea } from "@/components/ui/textarea";

function displayLabel(review: ReviewRow): string {
  if (review.display_name?.trim()) return review.display_name.trim();
  return "SinType user";
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={
            readonly
              ? "p-0"
              : "p-0.5 rounded hover:scale-110 transition-transform disabled:opacity-50"
          }
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <Star
            className="w-3 h-3"
            fill={n <= value ? "var(--neon-cyan)" : "transparent"}
            stroke={n <= value ? "var(--neon-cyan)" : "currentColor"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <article className="rounded-xl border border-white/10 bg-background/40 px-4 py-3 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium truncate">{displayLabel(review)}</p>
        <StarRating value={review.rating} readonly />
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
        {review.comment}
      </p>
      {review.created_at && (
        <p className="text-[10px] text-muted-foreground/70 mt-2">
          {formatWhen(review.created_at)}
        </p>
      )}
    </article>
  );
}

function ScrollingReviews({ reviews }: { reviews: ReviewRow[] }) {
  const loop = useMemo(
    () => (reviews.length > 0 ? [...reviews, ...reviews] : []),
    [reviews],
  );

  if (reviews.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  const durationSec = Math.max(18, reviews.length * 5);

  return (
    <div className="relative mt-3 h-28 overflow-hidden rounded-xl border border-white/5">
      <div
        className="flex flex-col gap-3 px-1 py-2 reviews-marquee"
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loop.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-8"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--card) 90%, transparent), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
        style={{
          background:
            "linear-gradient(to top, color-mix(in oklab, var(--card) 90%, transparent), transparent)",
        }}
      />
      <style>{`
        @keyframes reviews-scroll-down {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .reviews-marquee {
          animation-name: reviews-scroll-down;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .reviews-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export function ReviewsSection() {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const loadReviews = async () => {
    try {
      const rows = await fetchReviews();
      setReviews(rows);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
    const id = setInterval(() => void loadReviews(), 120_000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const displayName =
        profile?.email?.split("@")[0] ?? user.email?.split("@")[0] ?? null;
      await submitReview({
        userId: user.id,
        displayName,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      setSuccess(true);
      await loadReviews();
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError((err as Error).message ?? "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo="/download"
        title="Sign in to leave a review"
        description="Share your rating and feedback for SinType Desktop."
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-xl border border-white/10 p-3 flex flex-col w-full"
        style={{
          background: "color-mix(in oklab, var(--card) 80%, transparent)",
          WebkitBackdropFilter: "blur(20px)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
          <MessageSquareQuote className="w-2 h-2 text-[var(--neon-purple)]" />
          Community
        </div>
        <h3 className="font-display text-sm mt-0.5">Ratings & reviews</h3>
        <form onSubmit={onSubmit} className="mt-2.5 space-y-2">
          <div>
            <p className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Your rating
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What do you like about SinType?"
            rows={2}
            maxLength={2000}
            className="resize-none bg-background/50 border-white/10 text-xs"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))",
            }}
          >
            {submitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {user ? "Submit" : "Sign in"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && (
            <p className="text-xs text-[var(--neon-cyan)]">Thanks — review posted!</p>
          )}
        </form>

        <div className="mt-2.5 pt-2 border-t border-white/10 flex-1 min-h-0 flex flex-col">
          <p className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
            Recent feedback
          </p>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollingReviews reviews={reviews} />
          )}
        </div>
      </motion.div>
    </>
  );
}





