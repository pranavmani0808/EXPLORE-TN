// ExploreTN Vite TanStack Configuration
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    inlineDynamicImports: true,
  },
  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: false,
        },
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    ssr: {
      noExternal: ["@tanstack/react-router", "@tanstack/react-start"],
      target: "node",
    },
  },
});
