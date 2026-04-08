"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

function getCoverUrl(book) {
  if (book?.cover_i) return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
  if (book?.cover_edition_key) return `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
  return null;
}

function getBookNumericId(olid) {
  if (!olid) return 1;
  return olid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,cover_i,cover_edition_key,first_publish_year,subject`
        );
        const data = await res.json();
        setResults(data.docs || []);
      } catch (err) {
        toast.error("Search failed. Check your connection.");
        console.error("search error:", err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  return (
    <main className="search-page">
      <h1 className="search-page-title">
        Search results for: <em>&ldquo;{query}&rdquo;</em>
      </h1>

      {loading ? (
        <div className="books-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="book-card skeleton-card">
              <div className="book-card-img skeleton-img" />
              <div className="book-card-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="books-grid">
          {results.map((book, i) => {
            const cover = getCoverUrl(book);
            // Open Library search uses different field names
            const olid = book?.key?.replace("/works/", "") || "";
            const numId = getBookNumericId(olid);
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
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="book-card-placeholder">📖</div>
                  )}
                  <div className="book-card-body">
                    <h3 className="book-card-title">{book.title}</h3>
                    {book.author_name?.[0] && (
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
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>No results found for &ldquo;{query}&rdquo;. Try a different search.</p>
        </div>
      )}
    </main>
  );
}
