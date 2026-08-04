import { Window } from "happy-dom";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App.js";

const window = new Window({
  url: "http://localhost:5173/",
  width: 1024,
  height: 768,
});
(globalThis as any).window = window;
(globalThis as any).document = window.document;
(globalThis as any).localStorage = window.localStorage;
(globalThis as any).fetch = async (url: string) => {
  if (url === "/api/recetas" || url === "/ensulugar.json") {
    const fs = await import("node:fs");
    const raw = fs.readFileSync(
      new URL("../dist/ensulugar.json", import.meta.url),
      "utf-8",
    );
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(raw),
    } as Response;
  }
  throw new Error(`Unexpected fetch: ${url}`);
};

const container = window.document.createElement("div");
container.id = "root";
window.document.body.appendChild(container);

const root = createRoot(container as any);
root.render(createElement(App));

setTimeout(() => {
  console.log("--- RENDERED HTML ---");
  console.log(container.innerHTML.slice(0, 2000));
  console.log("--- END ---");
  process.exit(0);
}, 1500);
