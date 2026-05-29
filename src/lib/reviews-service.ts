import { supabase } from "@/integrations/supabase/client";

export interface ReviewRow {
  id: string;
  user_id: string | null;
  display_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export async function fetchReviews(limit = 40): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, display_name, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
}

export async function submitReview(params: {
  userId: string;
  displayName: string | null;
  rating: number;
  comment: string;
}): Promise<void> {
  const rating = Math.min(5, Math.max(1, Math.round(params.rating)));
  const comment = params.comment.trim();
  if (comment.length < 3) {
    throw new Error("Please write at least a few words in your review.");
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: params.userId,
    display_name: params.displayName?.trim() || null,
    rating,
    comment,
  });

  if (error) throw new Error(error.message);
}
