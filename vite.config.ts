import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: "/build/",
    publicDir: false,
    build: {
      target: "es2018",
      outDir: "static/build",
      emptyOutDir: true,
      manifest: "manifest.json",
      minify: !isDev,
      rollupOptions: {
        input: {
          site: "assets/ts/site.ts"
        },
        output: {
          entryFileNames: isDev ? "assets/[name].js" : "assets/[name]-[hash].js",
          chunkFileNames: isDev ? "assets/[name].js" : "assets/[name]-[hash].js",
          assetFileNames: isDev ? "assets/[name][extname]" : "assets/[name]-[hash][extname]"
        }
      }
    }
  };
});
