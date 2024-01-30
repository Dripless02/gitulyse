/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // https://avatars.githubusercontent.com/u/38259057?v=4
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
        ],
    },
};

module.exports = nextConfig;
