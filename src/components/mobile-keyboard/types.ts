import type { SyncConnectionStatus } from "@/lib/realtime-sync";

export type MobileKeyboardMode = "unicode" | "english";

export type MobileKeyboardLayer = "letters" | "numbers" | "symbols";

export type MobileSyncPayload = {
  latin: string;
  mode: MobileKeyboardMode;
};

export type MobileKeyboardProps = {
  /** Connection to main converter / PC */
  connectionStatus: SyncConnectionStatus;
  /** When false, keystrokes are not sent via onSync */
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  /** Debounced sync to website DB or local LAN API */
  onSync: (payload: MobileSyncPayload) => void;
  /** Clear remote + local buffer */
  onClear?: () => void;
  /** Optional subtitle under brand */
  connectionHint?: string;
  /** LAN-only: backspace on PC when local buffer is empty */
  onBackspaceRemote?: (count?: number) => void;
};
