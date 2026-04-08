"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getCoverUrl(book) {
  if (book?.covers?.[0]) return `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
  return null;
}

export function BookDetails({ bookDetails, loading, rating, error, onRetry }) {
  const router = useRouter();

  if (error) {
    return (
      <div className="error-state">
        <p>Could not load book details.</p>
        <button className="btn-secondary" onClick={onRetry}>Try Again</button>
        <button className="btn-secondary" onClick={() => router.push("/")}>Go Home</button>
      </div>
    );
  }

  if (loading || !bookDetails) {
    return (
      <div className="book-detail-skeleton">
        <div className="skeleton-cover" />
        <div className="skeleton-info">
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </div>
    );
  }

  const cover = getCoverUrl(bookDetails);
  const authors = bookDetails?.authors?.map((a) => a.author?.key).filter(Boolean) || [];
  const subjects = bookDetails?.subjects?.slice(0, 5) || [];
  const desc =
    typeof bookDetails?.description === "string"
      ? bookDetails.description
      : bookDetails?.description?.value || "";

  return (
    <section className="book-detail-section">
      <div className="book-detail-inner">
        {/* Cover */}
        <div className="book-detail-cover-wrap">
          {cover ? (
            <img
              src={cover}
              alt={bookDetails.title}
              className="book-detail-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="book-detail-cover-placeholder">📖</div>
          )}
        </div>

        {/* Meta */}
        <div className="book-detail-meta">
          <h1 className="book-detail-title">{bookDetails.title}</h1>

          {subjects.length > 0 && (
            <div className="book-subjects">
              {subjects.map((s, i) => (
                <span key={i} className="subject-tag">{s}</span>
              ))}
            </div>
          )}

          {desc && <p className="book-detail-desc">{desc.slice(0, 400)}{desc.length > 400 ? "..." : ""}</p>}

          {/* On-Chain Rating Display */}
          <div className="chain-rating-wrap">
            <h3 className="chain-rating-title">🔗 On-Chain Community Rating</h3>
            {rating && Number(rating.totalReviews) > 0 ? (
              <div className="chain-rating-grid">
                <div className="chain-overall">
                  <span className="chain-overall-num">{Number(rating.avgOverall)}</span>
                  <span className="chain-overall-label">/ 10 Overall</span>
                </div>
                <div className="chain-breakdown">
                  {[
                    { label: "Genre", value: rating.avgGenre, color: "#a78bfa" },
                    { label: "Plot", value: rating.avgPlot, color: "#34d399" },
                    { label: "Characters", value: rating.avgCharacter, color: "#f59e0b" },
                    { label: "World", value: rating.avgWorld, color: "#60a5fa" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="chain-score-row">
                      <span className="chain-score-label">{label}</span>
                      <div className="chain-score-track">
                        <div
                          className="chain-score-fill"
                          style={{
                            width: `${(Number(value) / 10) * 100}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="chain-score-num">{Number(value)}/10</span>
                    </div>
                  ))}
                </div>
                <p className="chain-total">
                  Based on {Number(rating.totalReviews)} review{Number(rating.totalReviews) !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <p className="no-chain-rating">No ratings yet — be the first reviewer!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
