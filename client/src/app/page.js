"use client";

import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../utils/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";
import { LatestBookReviews } from "../components/LatestReviews/LatestBookReviews";
import BookSearch from "../components/layout/BookSearch";
import BookHeroSection from "../components/layout/BookHeroSection";
import TrendingBooks from "../components/TrendingBooks";

export default function Home() {
  const { contract } = useContext(AuthContext);

  const [trendingBooks, setTrendingBooks] = useState(null);
  const [latestReviews, setLatestReviews] = useState(null);
  const [latestReviewsLoading, setLatestReviewsLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Fetch trending books from Open Library
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          "https://openlibrary.org/trending/now.json?limit=12"
        );
        const data = await res.json();
        setTrendingBooks(data);
        setTrendingLoading(false);
      } catch (err) {
        console.error("Error fetching trending books:", err);
        toast.error("Could not load trending books. Check your connection.");
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Fetch latest on-chain reviews
  useEffect(() => {
    const fetchLatest = async () => {
      if (!contract) return;
      try {
        const res = await contract.getLatestBookReviews(10);
        setLatestReviews(res);
        setLatestReviewsLoading(false);
      } catch (err) {
        console.error("Error fetching latest reviews:", err);
        setLatestReviewsLoading(false);
      }
    };
    if (contract) fetchLatest();
  }, [contract]);

  return (
    <>
      <BookHeroSection trendingBooks={trendingBooks} loading={trendingLoading} />
      <BookSearch />
      <TrendingBooks data={trendingBooks} loading={trendingLoading} />
      <LatestBookReviews
        latestReviews={latestReviews}
        loading={latestReviewsLoading}
      />
    </>
  );
}
