"use client";

import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../../utils/AuthContext";
import { toast } from "react-toastify";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { CSSTransition } from "react-transition-group";

// ─── Score Slider ────────────────────────────────────────────────────────────
function ScoreSlider({ label, description, icon, value, onChange }) {
  return (
    <div className="score-slider-group">
      <div className="score-slider-header">
        <span className="score-slider-icon">{icon}</span>
        <span className="score-slider-label">{label}</span>
        <span className="score-slider-val">{value}/10</span>
      </div>
      <p className="score-slider-desc">{description}</p>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="score-slider"
      />
      <div className="score-slider-ticks">
        <span>1</span><span>5</span><span>10</span>
      </div>
    </div>
  );
}

// ─── Score Bar ───────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color }) {
  const pct = (Number(value) / 10) * 100;
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="score-bar-num">{Number(value)}/10</span>
    </div>
  );
}

// ─── Rating Radar Display ────────────────────────────────────────────────────
function RatingDisplay({ rating }) {
  if (!rating || Number(rating.totalReviews) === 0) {
    return (
      <div className="no-rating-msg">No on-chain ratings yet. Be the first!</div>
    );
  }
  return (
    <div className="rating-display">
      <div className="overall-score-circle">
        <span className="overall-num">{Number(rating.avgOverall)}</span>
        <span className="overall-denom">/10</span>
      </div>
      <div className="rating-bars">
        <ScoreBar label="Genre" value={rating.avgGenre} color="#a78bfa" />
        <ScoreBar label="Plot" value={rating.avgPlot} color="#34d399" />
        <ScoreBar label="Characters" value={rating.avgCharacter} color="#f59e0b" />
        <ScoreBar label="World Building" value={rating.avgWorld} color="#60a5fa" />
      </div>
      <p className="total-reviews-label">
        Based on {Number(rating.totalReviews)} review{Number(rating.totalReviews) !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, reviewIndex, userAddress, contract }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [localVotes, setLocalVotes] = useState(Number(review.helpfulVotes));
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const checkVote = async () => {
      if (!contract || !userAddress) return;
      try {
        const voted = await contract.hasVotedOnReview(reviewIndex, userAddress);
        setHasVoted(voted);
      } catch {}
    };
    checkVote();
  }, [contract, userAddress, reviewIndex]);

  const handleVote = async (helpful) => {
    if (!contract) {
      toast.error("Connect your wallet to vote.");
      return;
    }
    if (hasVoted) {
      toast.warning("You have already voted on this review.");
      return;
    }
    if (review.userAddress?.toLowerCase() === userAddress?.toLowerCase()) {
      toast.error("You cannot vote on your own review.");
      return;
    }
    setVoting(true);
    try {
      await toast.promise(
        contract.voteOnReview(reviewIndex, helpful),
        {
          pending: "Submitting vote...",
          success: "Vote recorded on-chain! 🗳️",
          error: "Something went wrong.",
        }
      );
      setHasVoted(true);
      setLocalVotes((v) => v + (helpful ? 1 : -1));
    } catch (err) {
      console.error("Vote error:", err);
    }
    setVoting(false);
  };

  const addr = review.userAddress || "";
  const seed = parseInt(addr.slice(2, 10) || "1234", 16);
  const ts = Number(review.timestamp)
    ? new Date(Number(review.timestamp) * 1000).toLocaleDateString("en-GB", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

  return (
    <article className="review-full-card">
      {/* Header */}
      <div className="review-full-header">
        <Jazzicon diameter={44} seed={seed} />
        <div className="reviewer-meta">
          <span className="reviewer-addr">
            {addr.slice(0, 6)}...{addr.slice(-4)}
          </span>
          <time className="reviewer-time">{ts}</time>
        </div>
        <div className="review-overall-badge">⭐ {Number(review.overallScore)}/10</div>
      </div>

      {/* Comment */}
      <p className="review-text">{review.comment}</p>

      {/* Multi-Scores */}
      <div className="review-multi-scores">
        <div className="mini-score purple">
          <span>🎭</span>
          <span>Genre</span>
          <strong>{Number(review.genreScore)}</strong>
        </div>
        <div className="mini-score green">
          <span>📈</span>
          <span>Plot</span>
          <strong>{Number(review.plotScore)}</strong>
        </div>
        <div className="mini-score amber">
          <span>👤</span>
          <span>Characters</span>
          <strong>{Number(review.characterScore)}</strong>
        </div>
        <div className="mini-score blue">
          <span>🌍</span>
          <span>World</span>
          <strong>{Number(review.worldScore)}</strong>
        </div>
      </div>

      {/* Rate the Rater */}
      <div className="rate-rater-row">
        <span className="rate-rater-label">Was this review helpful?</span>
        <button
          className={`vote-btn helpful ${hasVoted ? "voted" : ""}`}
          onClick={() => handleVote(true)}
          disabled={hasVoted || voting}
          title="Helpful review"
        >
          👍 Yes
        </button>
        <button
          className={`vote-btn unhelpful ${hasVoted ? "voted" : ""}`}
          onClick={() => handleVote(false)}
          disabled={hasVoted || voting}
          title="Unhelpful review"
        >
          👎 No
        </button>
        <span className={`helpful-count ${localVotes >= 0 ? "pos" : "neg"}`}>
          {localVotes >= 0 ? `+${localVotes}` : localVotes}
        </span>
      </div>
    </article>
  );
}

// ─── Review Popup Form ───────────────────────────────────────────────────────
function ReviewPopup({ open, onClose, onSubmit }) {
  const [genre, setGenre] = useState(5);
  const [plot, setPlot] = useState(5);
  const [character, setCharacter] = useState(5);
  const [world, setWorld] = useState(5);
  const [comment, setComment] = useState("");

  const overall = Math.round((genre + plot + character + world) / 4);

  const handleSubmit = () => {
    if (comment.trim().length < 50) {
      toast.error("Review must be at least 50 characters.");
      return;
    }
    onSubmit({ genre, plot, character, world, comment, overall });
  };

  return (
    <CSSTransition in={open} timeout={300} classNames="popup" unmountOnExit>
      <div className="popup-overlay">
        <div className="popup-backdrop" onClick={onClose} />
        <div className="popup-panel">
          <div className="popup-header">
            <h2>📝 Write Your Review</h2>
            <button className="popup-close" onClick={onClose}>✕</button>
          </div>

          <div className="popup-body">
            {/* Overall Preview */}
            <div className="overall-preview">
              <div className="overall-preview-circle">{overall}</div>
              <span>Overall Score</span>
            </div>

            <ScoreSlider
              label="Genre Accuracy"
              icon="🎭"
              description="How well does the book deliver on its stated genre?"
              value={genre}
              onChange={setGenre}
            />
            <ScoreSlider
              label="Plot Development"
              icon="📈"
              description="How engaging and well-structured is the narrative?"
              value={plot}
              onChange={setPlot}
            />
            <ScoreSlider
              label="Character Development"
              icon="👤"
              description="How believable and compelling are the characters?"
              value={character}
              onChange={setCharacter}
            />
            <ScoreSlider
              label="World Building"
              icon="🌍"
              description="How immersive and consistent is the setting/universe?"
              value={world}
              onChange={setWorld}
            />

            <div className="popup-comment-wrap">
              <textarea
                className="popup-textarea"
                placeholder="Share your thoughts about this book... (min. 50 characters)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <span className="char-count">
                {comment.length < 50
                  ? `${50 - comment.length} more characters needed`
                  : "✓ Minimum met"}
              </span>
            </div>
          </div>

          <div className="popup-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>
              Submit on Blockchain
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
}

// ─── Main Reviews Component ──────────────────────────────────────────────────
export function BookReviews({
  bookId,
  bookName,
  isReview,
  setIsReview,
  userReviews,
  reviewIndices,
  getBookReviews,
  getBookRating,
  reviewLoading,
}) {
  const { isLogged, contract, address } = useContext(AuthContext);
  const [popup, setPopup] = useState(false);

  const openPopup = () => {
    if (!isLogged) {
      toast.error("Please connect your wallet first.");
      return;
    }
    document.body.style.overflow = "hidden";
    setPopup(true);
  };

  const closePopup = () => {
    document.body.style.overflow = "";
    setPopup(false);
  };

  const handleSubmit = async ({ genre, plot, character, world, comment }) => {
    try {
      await toast.promise(
        contract.rateBook(bookId, bookName, comment, genre, plot, character, world),
        {
          pending: "Submitting your review on-chain...",
          success: {
            render() {
              setIsReview(true);
              closePopup();
              getBookRating();
              getBookReviews();
              return "Review published on-chain! 🎉";
            },
          },
          error: "Transaction failed. 😕",
        }
      );
    } catch (err) {
      console.error("rateBook error:", err);
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-section-header">
        <h2 className="reviews-title">
          <div className="title-accent" />
          Community Reviews
        </h2>
        {!isReview && (
          <button id="write-review-btn" className="btn-primary" onClick={openPopup}>
            + Write Review
          </button>
        )}
        {isReview && (
          <span className="already-reviewed">✅ You reviewed this book</span>
        )}
      </div>

      <ReviewPopup open={popup} onClose={closePopup} onSubmit={handleSubmit} />

      <div className="reviews-list">
        {reviewLoading ? (
          <div className="reviews-loading">Loading reviews from blockchain...</div>
        ) : userReviews && userReviews.length > 0 ? (
          userReviews.map((review, i) => (
            <ReviewCard
              key={i}
              review={review}
              reviewIndex={reviewIndices ? reviewIndices[i] : i}
              userAddress={address}
              contract={contract}
            />
          ))
        ) : (
          <div className="empty-reviews">
            <span>📚</span>
            <p>No reviews yet for this book. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { RatingDisplay };
