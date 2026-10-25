import { defineConfig } from "vitest/config";
import * as vite from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const stub = (f) => path.resolve(root, "tests/stubs", f);

// Next.js lets you write JSX inside .js files (page.js, layout.js ...). The test runner
// doesn't, so this small plugin reads those files as JSX before anything else touches them.
const jsxInJsFiles = {
  name: "jsx-in-js-files",
  enforce: "pre",
  async transform(code, id) {
    const file = id.split("?")[0];
    if (!file.endsWith(".js") || file.includes("node_modules") || !file.startsWith(root)) return null;
    // Newer Vite uses oxc, older Vite uses esbuild. Use whichever this install has.
    if (vite.transformWithOxc) return vite.transformWithOxc(code, file, { lang: "jsx", jsx: { runtime: "automatic" } });
    return vite.transformWithEsbuild(code, file, { loader: "jsx", jsx: "automatic" });
  },
};

export default defineConfig({
  plugins: [jsxInJsFiles],
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": root,
      "next/image": stub("next-image.jsx"),
      "next/link": stub("next-link.jsx"),
      "next/navigation": stub("next-navigation.js"),
    },
  },
  test: { environment: "jsdom", include: ["tests/**/*.test.{js,jsx}"] },
});