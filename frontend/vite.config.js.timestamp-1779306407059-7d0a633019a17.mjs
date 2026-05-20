// vite.config.js
import { defineConfig } from "file:///sessions/laughing-relaxed-brown/mnt/Claim%20AI/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/laughing-relaxed-brown/mnt/Claim%20AI/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy przekierowuje /api/* do backendu podczas developmentu
    // Dzięki temu nie musisz pisać pełnego URL w fetch() — wystarczy "/api/analyze"
    // To odpowiednik UseProxy() w ASP.NET SPA templates
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvbGF1Z2hpbmctcmVsYXhlZC1icm93bi9tbnQvQ2xhaW0gQUkvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9sYXVnaGluZy1yZWxheGVkLWJyb3duL21udC9DbGFpbSBBSS9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvbGF1Z2hpbmctcmVsYXhlZC1icm93bi9tbnQvQ2xhaW0lMjBBSS9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICAvLyBQcm94eSBwcnpla2llcm93dWplIC9hcGkvKiBkbyBiYWNrZW5kdSBwb2RjemFzIGRldmVsb3BtZW50dVxuICAgIC8vIER6aVx1MDExOWtpIHRlbXUgbmllIG11c2lzeiBwaXNhXHUwMTA3IHBlXHUwMTQybmVnbyBVUkwgdyBmZXRjaCgpIFx1MjAxNCB3eXN0YXJjenkgXCIvYXBpL2FuYWx5emVcIlxuICAgIC8vIFRvIG9kcG93aWVkbmlrIFVzZVByb3h5KCkgdyBBU1AuTkVUIFNQQSB0ZW1wbGF0ZXNcbiAgICBwcm94eToge1xuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMVwiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1YsU0FBUyxvQkFBb0I7QUFDblgsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
