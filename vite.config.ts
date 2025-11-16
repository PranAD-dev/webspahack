import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webSpatial from "@webspatial/vite-plugin";
import { createHtmlPlugin } from "vite-plugin-html";
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    // basicSsl(),
    webSpatial(),
    createHtmlPlugin({
      inject: {
        data: {
          XR_ENV: process.env.XR_ENV,
        },
      },
    }),
  ],
});