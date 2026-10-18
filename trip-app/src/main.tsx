import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(<App />);

// With registerType "autoUpdate" this activates a new service worker as soon as
// it is installed and reloads open pages onto the new build. Without it, people
// keep seeing the previous version until they happen to reload a second time.
// Checking hourly also catches long-lived tabs (an installed app left open).
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (reg) setInterval(() => reg.update(), 60 * 60 * 1000);
  },
});
