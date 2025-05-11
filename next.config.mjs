/** @type {import('next').NextConfig} */
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
    unoptimized: true,
  },
  // 明确禁用国际化
  i18n: null,
  experimental: {
    // 启用包优化，自动优化大型依赖
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-alert-dialog',
      'sonner'
    ],
    // 注意：modularizeImports 已被移除，因为 Next.js 15.2.3 不支持
  },
  // 注意：swcMinify 已被移除，因为 Next.js 15.2.3 不支持
  // 配置webpack以优化Tree Shaking
  webpack: (config, { dev, isServer }) => {
    // 生产环境下启用额外的优化
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
