/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 他の設定 ...
  eslint: {
    // ビルド時にESLintによるエラーチェックを無効化
    ignoreDuringBuilds: true,
  },
  // TypeScriptのエラーチェックを無効化
  typescript: {
    // ビルド時のType Checkをスキップ
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 