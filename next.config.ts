import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nginx faz buffering por padrão, o que quebra streaming/Suspense do App
  // Router quando self-hosted atrás de um reverse proxy.
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ];
  },
};

export default nextConfig;
