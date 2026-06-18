/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oufchidafmrxgympbcqo.supabase.co";
    return [
      {
        source: "/functions/v1/:path*",
        destination: `${supabaseUrl}/functions/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
