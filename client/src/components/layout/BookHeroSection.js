"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Converts an Open Library cover ID or works key to a cover image URL
function getCoverUrl(book) {
  if (book?.cover_id) {
    return `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
  }
  if (book?.cover_edition_key) {
    return `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`;
  }
  return "/placeholder-book.png";
}

function getBookOLID(book) {
  // Use the first work key as identifier, strip "/works/"
  if (book?.key) return book.key.replace("/works/", "");
  return null;
}

export default function BookHeroSection({ trendingBooks, loading }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const books = trendingBooks?.works || [];

  useEffect(() => {
    if (books.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % Math.min(books.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [books]);

  if (loading || books.length === 0) {
    return (
      <div className="hero-skeleton">
        <div className="hero-skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-subtitle" />
          <div className="skeleton-btn" />
        </div>
      </div>
    );
  }

  const featured = books[currentIdx];
  const olid = getBookOLID(featured);
  const bookNumericId = olid
    ? olid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : currentIdx + 1;

  return (
    <section className="hero-section">
      {/* Background blur image */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${getCoverUrl(featured)})` }}
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        {/* Cover */}
        <div className="hero-cover-wrap">
          <img
            src={getCoverUrl(featured)}
            alt={featured.title}
            className="hero-cover"
            onError={(e) => { e.target.src = "/placeholder-book.png"; }}
          />
        </div>

        {/* Info */}
        <div className="hero-info">
          <span className="hero-badge">📚 Trending Now</span>
          <h1 className="hero-title">{featured.title}</h1>
          {featured.author_name && (
            <p className="hero-author">by {featured.author_name.slice(0, 2).join(", ")}</p>
          )}
          {featured.first_publish_year && (
            <p className="hero-meta">First published: {featured.first_publish_year}</p>
          )}
          <div className="hero-actions">
            <Link href={`/book/${bookNumericId}?olid=${olid || ""}&title=${encodeURIComponent(featured.title)}`}>
              <button className="btn-primary">View &amp; Rate</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="hero-dots">
        {books.slice(0, 5).map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === currentIdx ? "active" : ""}`}
            onClick={() => setCurrentIdx(i)}
          />
        ))}
      </div>
    </section>
  );
}
