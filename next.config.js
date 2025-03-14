/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 他の設定 ...
  eslint: {
    // ビルド時にESLintによるエラーチェックを無効化
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 