import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 👈 Esto es lo que necesitas agregar
  images: {
    unoptimized: true, // Deshabilita la optimización de imágenes
  },
  webpack: (config) => {
    // Habilitar soporte para WebAssembly y capas
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      crypto: false,
      stream: false
    };
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };
    
    // Cambiar el manejo de archivos .wasm
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

export default nextConfig;
