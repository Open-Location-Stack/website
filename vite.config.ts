import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: "/build/",
    publicDir: false,
    build: {
      target: "es2020",
      outDir: "static/build",
      emptyOutDir: true,
      manifest: "manifest.json",
      watch: isDev
        ? {
            exclude: ["static/build/**"]
          }
        : null,
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
