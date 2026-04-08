import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "../utils/AuthContext";
const inter = Inter({ subsets: ["latin"] });
import { ToastContainer } from "react-toastify";

import "@smastrom/react-rating/style.css";
import "react-toastify/dist/ReactToastify.min.css";
import "pure-react-carousel/dist/react-carousel.es.css";

export const metadata = {
  title: "ChainReads – Decentralized Book Ratings",
  description:
    "ChainReads is a blockchain-powered book rating platform. Rate novels across genre, plot, character, and world-building — and let the community validate your reviews.",
  keywords:
    "ChainReads, blockchain, book rating, novel reviews, decentralized, Ethereum, DApp",
  openGraph: {
    type: "website",
    url: "https://chainreads.app/",
    title: "ChainReads – Decentralized Book Ratings",
    description:
      "Rate novels on the blockchain. Multi-dimensional scoring for genre, plot, characters, and world-building.",
    site_name: "ChainReads",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={true}
            newestOnTop={false}
            theme="dark"
          />
          <NavBar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
