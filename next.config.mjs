/** @type {import('next').NextConfig} */

function hostnameFromUrl(raw) {
  if (!raw?.trim()) return null
  try {
    return new URL(raw.trim()).hostname
  } catch {
    return null
  }
}

const r2Host = hostnameFromUrl(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      ...(r2Host
        ? [
            {
              protocol: 'https',
              hostname: r2Host,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ]
  },
}

export default nextConfig