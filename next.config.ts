import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { webpack }: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      https: false,
      http: false,
      url: false,
      zlib: false,
      stream: false,
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    return config;
  },
};

export default nextConfig;
