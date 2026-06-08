/** Parse singlish_and_unicode.txt into display layers (read-only reference). */

export type MappingPair = {
  singlish: string;
  unicode: string;
  index: number;
};

export type MappingLayer = {
  number: number;
  pairs: MappingPair[];
};

const START_RE = /^(\d+)\.start\s*(.*)$/i;
const BLOCK_END_RE = /\bend\s*$/i;

const VOWEL_LAYER = 1;
const ACCORDION_LAYER_MIN = 2;
const ACCORDION_LAYER_MAX = 40;
const HIDDEN_LAYERS = new Set([41, 42]);

function sinhalaScriptScore(text: string): number {
  let n = 0;
  for (const c of text) {
    const code = c.codePointAt(0) ?? 0;
    if (code >= 0x0d80 && code <= 0x0dff) n += 1;
  }
  return n;
}

function splitUnicodeLegacy(rowA: string, rowB: string): [string, string] {
  const sa = sinhalaScriptScore(rowA);
  const sb = sinhalaScriptScore(rowB);
  if (sa > sb) return [rowA, rowB];
  if (sb > sa) return [rowB, rowA];
  return [rowA, rowB];
}

function stripBlockEndMarker(legacyRow: string): string {
  return legacyRow.replace(BLOCK_END_RE, "").trimEnd();
}

function nextNonempty(lines: string[], index: number): [number, string] {
  let i = index;
  while (i < lines.length) {
    const stripped = lines[i].trim();
    if (stripped) return [i, stripped];
    i += 1;
  }
  return [i, ""];
}

export function parseMappingLayers(raw: string): MappingLayer[] {
  const rawLines = raw.split(/\r?\n/);
  const layers: MappingLayer[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i].trim();
    i += 1;
    const m = line.match(START_RE);
    if (!m) continue;

    const layerNum = parseInt(m[1], 10);
    const singlishLine = (m[2] ?? "").trim();
    let rowA: string;
    [i, rowA] = nextNonempty(rawLines, i);
    if (!rowA) continue;
    i += 1;
    let rowB: string;
    [i, rowB] = nextNonempty(rawLines, i);
    if (!rowB) continue;
    i += 1;

    const [unicodeRow, legacyRowRaw] = splitUnicodeLegacy(rowA, rowB);
    const legacyRow = stripBlockEndMarker(legacyRowRaw);

    const sinTokens = singlishLine.split(/\s+/).filter(Boolean);
    const legTokens = legacyRow.split(/\s+/).filter(Boolean);
    const uniTokens = unicodeRow.split(/\s+/).filter(Boolean);
    const n = Math.min(sinTokens.length, legTokens.length, uniTokens.length);

    const pairs: MappingPair[] = [];
    for (let idx = 0; idx < n; idx += 1) {
      const s = sinTokens[idx];
      if (!s) continue;
      pairs.push({
        singlish: s,
        unicode: uniTokens[idx],
        index: idx,
      });
    }

    layers.push({ number: layerNum, pairs });
  }

  return layers;
}

export function layersForUi(raw: string): {
  vowel: MappingLayer | null;
  accordion: MappingLayer[];
} {
  let vowel: MappingLayer | null = null;
  const accordion: MappingLayer[] = [];

  for (const layer of parseMappingLayers(raw)) {
    if (HIDDEN_LAYERS.has(layer.number)) continue;
    if (layer.number === VOWEL_LAYER) vowel = layer;
    else if (
      layer.number >= ACCORDION_LAYER_MIN &&
      layer.number <= ACCORDION_LAYER_MAX &&
      layer.pairs.length > 0
    ) {
      accordion.push(layer);
    }
  }

  return { vowel, accordion };
}

let cachedLayers: { vowel: MappingLayer | null; accordion: MappingLayer[] } | null =
  null;

/** Load bundled mapping reference (cached after first fetch). */
export async function loadMappingLayersForUi(): Promise<{
  vowel: MappingLayer | null;
  accordion: MappingLayer[];
}> {
  if (cachedLayers) return cachedLayers;
  const res = await fetch("/data/singlish_and_unicode.txt");
  if (!res.ok) throw new Error("Could not load mapping reference.");
  const text = await res.text();
  cachedLayers = layersForUi(text);
  return cachedLayers;
}
