import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

export function OptionalShareCard() {
  const onShare = (network: "whatsapp" | "facebook") => {
    const url = "https://sintype.lk";
    const text = "I just found SinType.lk — Singlish to Sinhala converter. Try it!";
    const target =
      network === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(target, "_blank", "noopener,noreferrer,width=720,height=620");
  };

  return (
    <div
      className="rounded-3xl border border-white/10 p-6 sm:p-8 mt-8"
      style={{
        background: "color-mix(in oklab, var(--card) 75%, transparent)",
        backdropFilter: "blur(14px)",
      }}
    >
      <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto">
        Help us grow! Share SinType with your friends{" "}
        <span className="text-foreground/80">(Optional)</span>
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mt-5 max-w-xl mx-auto">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShare("whatsapp")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
        >
          <Share2 className="w-4 h-4" /> WhatsApp
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShare("facebook")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #1877F2, #0a4cc4)" }}
        >
          <Share2 className="w-4 h-4" /> Facebook
        </motion.button>
      </div>
    </div>
  );
}
