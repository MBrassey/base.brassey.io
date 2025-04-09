/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'source.boringavatars.com', 
      'cdn.stamp.fyi', 
      'api.dicebear.com', 
      'avatar.vercel.sh', 
      'effigy.im'
    ],
  },
};

export default nextConfig;
