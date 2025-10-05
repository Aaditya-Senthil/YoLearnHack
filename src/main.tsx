// Polyfill for global in browser
if (typeof window !== "undefined" && typeof global === "undefined") {
  (window as any).global = window;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
