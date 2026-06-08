/** SinType Desktop v2.0 Beta — feature copy & screenshot manifest. */

export const V2_TAGLINE =
  "Now with a built-in Local Web Server — seamless mobile-to-PC synchronization. Use your smartphone as a wireless touchpad, keyboard, and file-transfer remote.";

export const V2_FEATURES = [
  {
    id: "wireless-remote",
    title: "Wireless Mouse & Keyboard",
    description:
      "Turn your phone into a touchpad and keyboard for your PC. Press Spacebar to instantly swap between remote control and typing modes.",
    icon: "mouse-pointer-click" as const,
  },
  {
    id: "file-sync",
    title: "Mobile-to-PC File Sync",
    description:
      "Transfer files securely over your local Wi-Fi at high speed. No cloud upload — data stays on your private network.",
    icon: "folder-sync" as const,
  },
  {
    id: "qr-activation",
    title: "Mobile-QR Activation",
    description:
      "Scan a QR code from the desktop app to activate your license key effortlessly from your phone.",
    icon: "qr-code" as const,
  },
  {
    id: "mapping-editor",
    title: "Easy Mapping Editor",
    description:
      "Complete control over your Singlish typing rules. Customize mappings without editing config files.",
    icon: "sliders-horizontal" as const,
  },
] as const;

export type V2Screenshot = {
  src: string;
  alt: string;
  caption: string;
};

export const V2_SCREENSHOTS: V2Screenshot[] = [
  {
    src: "/v2/mobile-remote.svg",
    alt: "SinType mobile remote keyboard and touchpad on a phone connected to Windows",
    caption: "Wireless touchpad & keyboard — control your PC from your phone.",
  },
  {
    src: "/v2/file-sync.svg",
    alt: "SinType local file transfer between mobile and desktop over Wi-Fi",
    caption: "High-speed file sync over your private LAN.",
  },
  {
    src: "/v2/qr-activation.svg",
    alt: "SinType QR code license activation from mobile device",
    caption: "Activate your license in seconds with Mobile-QR.",
  },
  {
    src: "/v2/mapping-editor.svg",
    alt: "SinType mapping editor for custom Singlish typing rules",
    caption: "Mapping editor — fine-tune every typing rule.",
  },
];

export const BETA_DISCLAIMER =
  "Notice: This is a Beta Release (v2.0.0). You may encounter occasional bugs or crashes. For stable use, please stick to the previous version. If you find bugs or have feature requests, please report them to help us improve!";

export const WHATSAPP_NUMBER = "+94769912116";
export const WHATSAPP_DISPLAY = "+94 76 991 2116";
export const WHATSAPP_URL = `https://wa.me/94769912116`;
