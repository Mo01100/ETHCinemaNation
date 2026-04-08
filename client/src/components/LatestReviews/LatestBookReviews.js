"use client";

import React from "react";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import Link from "next/link";

function formatAddress(addr) {
  if (!addr) return "Unknown";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatTimestamp(ts) {
  if (!ts) return "";
  try {
    return new Date(Number(ts) * 1000).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function ScorePill({ label, value }) {
  const pct = (Number(value) / 10) * 100;
  return (
    <div className="score-pill">
      <span className="score-label">{label}</span>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="score-value">{Number(value)}/10</span>
    </div>
  );
}

export function LatestBookReviews({ latestReviews, loading }) {
  return (
    <section className="latest-reviews-section">
      <div className="section-header">
        <div className="section-accent" />
        <h2 className="section-title">Latest On-Chain Reviews</h2>
      </div>

      {loading ? (
        <div className="reviews-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="review-card skeleton-review" />
          ))}
        </div>
      ) : latestReviews && latestReviews.length > 0 ? (
        <div className="reviews-grid">
          {latestReviews.map((review, i) => (
            <article className="review-card" key={i}>
              <div className="review-card-header">
                <Jazzicon
                  diameter={40}
                  seed={parseInt(review.userAddress?.slice(2, 10) || "1234", 16)}
                />
                <div>
                  <p className="reviewer-address">{formatAddress(review.userAddress)}</p>
                  <time className="review-time">{formatTimestamp(review.timestamp)}</time>
                </div>
                <div className="overall-badge">
                  ⭐ {Number(review.overallScore)}/10
                </div>
              </div>

              <Link
                href={`/book/${Number(review.bookId)}?title=${encodeURIComponent(review.bookName)}`}
                className="review-book-title"
              >
                📖 {review.bookName}
              </Link>

              <p className="review-comment">{review.comment}</p>

              <div className="review-scores">
                <ScorePill label="Genre" value={review.genreScore} />
                <ScorePill label="Plot" value={review.plotScore} />
                <ScorePill label="Characters" value={review.characterScore} />
                <ScorePill label="World" value={review.worldScore} />
              </div>

              <div className="review-helpful">
                <span className={`helpful-votes ${Number(review.helpfulVotes) >= 0 ? "positive" : "negative"}`}>
                  {Number(review.helpfulVotes) >= 0
                    ? `👍 ${Number(review.helpfulVotes)} found helpful`
                    : `👎 ${Math.abs(Number(review.helpfulVotes))} found unhelpful`}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <p>No on-chain reviews yet. Be the first to review a book!</p>
        </div>
      )}
    </section>
  );
}
