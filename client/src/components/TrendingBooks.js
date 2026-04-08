"use client";

import React from "react";
import Link from "next/link";

function getCoverUrl(book) {
  if (book?.cover_id) return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
  if (book?.cover_edition_key) return `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
  return null;
}

function getBookNumericId(book) {
  if (!book?.key) return 1;
  const olid = book.key.replace("/works/", "");
  return olid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function BookCardSkeleton() {
  return (
    <div className="book-card skeleton-card">
      <div className="book-card-img skeleton-img" />
      <div className="book-card-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

export default function TrendingBooks({ data, loading }) {
  const books = data?.works || [];

  return (
    <section className="trending-section">
      <div className="section-header">
        <div className="section-accent" />
        <h2 className="section-title">Trending Books</h2>
      </div>

      <div className="books-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
          : books.slice(0, 12).map((book, i) => {
              const cover = getCoverUrl(book);
              const numId = getBookNumericId(book);
              const olid = book?.key?.replace("/works/", "") || "";
              return (
                <Link
                  key={i}
                  href={`/book/${numId}?olid=${olid}&title=${encodeURIComponent(book.title)}`}
                  className="book-card-link"
                >
                  <article className="book-card">
                    {cover ? (
                      <img
                        src={cover}
                        alt={book.title}
                        className="book-card-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className="book-card-placeholder" style={{ display: cover ? "none" : "flex" }}>
                      📖
                    </div>
                    <div className="book-card-body">
                      <h3 className="book-card-title">{book.title}</h3>
                      {book.author_name && (
                        <p className="book-card-author">{book.author_name[0]}</p>
                      )}
                      {book.first_publish_year && (
                        <span className="book-card-year">{book.first_publish_year}</span>
                      )}
                    </div>
                    <div className="book-card-hover-overlay">
                      <span className="rate-cta">⭐ Rate this Book</span>
                    </div>
                  </article>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
