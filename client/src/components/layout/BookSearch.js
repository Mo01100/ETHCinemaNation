"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="search-section">
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="book-search-input"
            type="text"
            placeholder="Search for a book or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </div>
      </form>
    </section>
  );
}
