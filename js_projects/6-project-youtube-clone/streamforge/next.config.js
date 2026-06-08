 /** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // UploadThing
      {
        protocol: "https",
        hostname: "utfs.io",
      },

      // Cloudinary
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },

      // Google profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },

      // GitHub profile images
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },

      // Seed thumbnails
      {
        protocol: "https",
        hostname: "picsum.photos",
      },

      // DiceBear avatars
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
}; 

module.exports = nextConfig;
