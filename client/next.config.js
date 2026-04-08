require("dotenv").config();

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    // Keep backward compatibility; new vars use NEXT_PUBLIC_ prefix in AuthContext
    THEMOVIEDB_API_KEY: process.env.THEMOVIEDB_API_KEY,
  },
  images: {
    domains: [
      "covers.openlibrary.org",   // Open Library book covers
      "openlibrary.org",
      "image.tmdb.org",           // Legacy (original project)
      "localhost",
      "walletconnect.com",
    ],
  },
};
