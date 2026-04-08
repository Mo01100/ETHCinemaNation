"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import AuthContext from "../../utils/AuthContext";
import { BookDetails } from "./BookDetails";
import { BookReviews } from "./BookReviews";

export function SingleBook({ bookId }) {
  const searchParams = useSearchParams();
  const olid = searchParams?.get("olid");
  const titleParam = searchParams?.get("title");

  const { contract, address, isLogged } = useContext(AuthContext);

  const [bookDetails, setBookDetails] = useState(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState(false);

  const [rating, setRating] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewIndices, setReviewIndices] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [isReview, setIsReview] = useState(false);

  // Derived book name
  const bookName = bookDetails?.title || titleParam || "Unknown Book";

  // ── Fetch book details from Open Library ──────────────────────────────────
  const fetchBookDetails = useCallback(async () => {
    if (!olid) {
      // No OLID – show a stub so the page still works
      setBookDetails({ title: titleParam || "Unknown Book" });
      setBookLoading(false);
      return;
    }
    try {
      setBookLoading(true);
      const res = await fetch(`https://openlibrary.org/works/${olid}.json`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setBookDetails(data);
    } catch (err) {
      console.error("fetchBookDetails error:", err);
      setBookDetails({ title: titleParam || "Unknown Book" });
      setBookError(true);
    } finally {
      setBookLoading(false);
    }
  }, [olid, titleParam]);

  // ── Fetch on-chain rating ─────────────────────────────────────────────────
  const fetchRating = useCallback(async () => {
    if (!contract || !bookId) return;
    try {
      const result = await contract.getBookRating(bookId);
      setRating(result);
    } catch (err) {
      console.error("fetchRating error:", err);
    }
  }, [contract, bookId]);

  // ── Fetch on-chain reviews ────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!contract || !bookId) return;
    try {
      setReviewLoading(true);
      const [revs, indices] = await Promise.all([
        contract.getBookReviews(bookId),
        contract.getBookReviewIndices(bookId),
      ]);
      setUserReviews(revs);
      setReviewIndices(indices.map((i) => Number(i)));
    } catch (err) {
      console.error("fetchReviews error:", err);
      toast.error("Could not load reviews from blockchain.");
    } finally {
      setReviewLoading(false);
    }
  }, [contract, bookId]);

  // ── Check if current user already reviewed ───────────────────────────────
  const checkAlreadyReviewed = useCallback(async () => {
    if (!contract || !address || !bookId) return;
    try {
      const reviewed = await contract.isBookRatedByUser(bookId, address);
      setIsReview(reviewed);
    } catch (err) {
      console.error("checkAlreadyReviewed error:", err);
    }
  }, [contract, address, bookId]);

  useEffect(() => { fetchBookDetails(); }, [fetchBookDetails]);
  useEffect(() => { fetchRating(); fetchReviews(); }, [fetchRating, fetchReviews]);
  useEffect(() => { if (isLogged) checkAlreadyReviewed(); }, [isLogged, checkAlreadyReviewed]);

  return (
    <>
      <BookDetails
        bookDetails={bookDetails}
        loading={bookLoading}
        rating={rating}
        error={bookError}
        onRetry={() => { setBookError(false); fetchBookDetails(); }}
      />
      <BookReviews
        bookId={Number(bookId)}
        bookName={bookName}
        isReview={isReview}
        setIsReview={setIsReview}
        userReviews={userReviews}
        reviewIndices={reviewIndices}
        getBookReviews={fetchReviews}
        getBookRating={fetchRating}
        reviewLoading={reviewLoading}
      />
    </>
  );
}
