import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RouterProvider } from "./router";
import { legacyHashPath } from "./routes";
import "./styles.css";

// Links from before real URLs (#calculators/car and so on) still work
const legacy = window.location.pathname === "/" ? legacyHashPath(window.location.hash) : null;
if (legacy) window.history.replaceState(null, "", legacy);

// The HTML is prerendered for search engines and link previews. Render fresh rather than hydrate, because progress,
// calculator inputs and date defaults come from this browser and today's date, so they differ from the build.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
