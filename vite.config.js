import { defineConfig } from "vite";

export default defineConfig({
  base: "/amazon-location-service-demo/",
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  }
})