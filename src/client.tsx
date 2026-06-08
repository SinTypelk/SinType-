import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

// Temporary: deliberately NOT using React.StrictMode during OAuth debugging.
startTransition(() => {
  hydrateRoot(document, <StartClient />);
});

