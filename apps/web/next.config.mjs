/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@szmaciura/shared"],
};

export default nextConfig;
