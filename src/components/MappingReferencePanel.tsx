import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, GripHorizontal, X } from "lucide-react";
import {
  loadMappingLayersForUi,
  type MappingLayer,
  type MappingPair,
} from "@/lib/mapping-layers";

function MappingRow({
  pair,
  header = false,
}: {
  pair: MappingPair;
  header?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 px-4 py-2.5 border-b border-border/50 ${
        header ? "bg-secondary/40" : ""
      }`}
    >
      <span
        className={`text-left ${header ? "text-lg font-medium" : "text-base"}`}
        lang="si"
      >
        {pair.unicode.replace(/\n/g, " ")}
      </span>
      <span
        className={`text-right font-mono text-sm ${
          header ? "text-[var(--neon-cyan)]" : "text-muted-foreground"
        }`}
      >
        {pair.singlish}
      </span>
    </div>
  );
}

function AccordionLayer({
  layer,
  expanded,
  onToggle,
}: {
  layer: MappingLayer;
  expanded: boolean;
  onToggle: () => void;
}) {
  const header = layer.pairs[0];
  if (!header) return null;

  return (
    <div className="rounded-xl border border-border/80 overflow-hidden bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left hover:bg-accent/20 transition-colors"
        aria-expanded={expanded}
      >
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 px-3 py-2 border-b border-border/50">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-lg font-medium" lang="si">
            {header.unicode.replace(/\n/g, " ")}
          </span>
          <span className="text-right font-mono text-sm text-[var(--neon-cyan)]">
            {header.singlish}
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {layer.pairs.slice(1).map((pair) => (
              <MappingRow key={`${layer.number}-${pair.index}`} pair={pair} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MappingReferencePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vowel, setVowel] = useState<MappingLayer | null>(null);
  const [accordion, setAccordion] = useState<MappingLayer[]>([]);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadMappingLayersForUi()
      .then((data) => {
        if (cancelled) return;
        setVowel(data.vowel);
        setAccordion(data.accordion);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load mappings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setExpandedLayer(null);
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[min(85vh,720px)] rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow:
            "0 0 40px color-mix(in oklab, var(--neon-cyan) 25%, transparent)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mapping-ref-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GripHorizontal className="w-4 h-4 hidden sm:block" />
            <div>
              <p
                id="mapping-ref-title"
                className="text-xs uppercase tracking-widest text-[var(--neon-cyan)]"
              >
                Singlish mapping
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Read-only reference — same as SinType Desktop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent/40"
            aria-label="Close mapping reference"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 vk-scroll">
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading mappings…
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}

          {!loading && !error && vowel && vowel.pairs.length > 0 && (
            <section>
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-1">
                Vowels
              </h3>
              <div className="rounded-xl border border-border/80 overflow-hidden neon-border">
                {vowel.pairs.map((pair) => (
                  <MappingRow key={`v-${pair.index}`} pair={pair} />
                ))}
              </div>
            </section>
          )}

          {!loading && !error && accordion.length > 0 && (
            <section>
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-1">
                Consonants &amp; compounds
              </h3>
              <p className="text-xs text-muted-foreground mb-3 px-1">
                Tap a row to expand variants (ka → kaa, ki, koo…).
              </p>
              <div className="space-y-2">
                {accordion.map((layer) => (
                  <AccordionLayer
                    key={layer.number}
                    layer={layer}
                    expanded={expandedLayer === layer.number}
                    onToggle={() =>
                      setExpandedLayer((prev) =>
                        prev === layer.number ? null : layer.number,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
