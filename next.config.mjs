/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./loader.js",
  },
  reactCompiler: true,
};

export default nextConfig;
