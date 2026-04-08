// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title BookRatings
 * @dev A decentralized book rating system with multi-dimensional ratings and reviewer reputation.
 *
 * Features:
 *  - Rate books across 4 dimensions: genre accuracy, plot development, character development, world building
 *  - Reviewer reputation system: other users can vote on whether a review is helpful/accurate
 *  - Retrieve individual book ratings, user reviews, and latest reviews globally
 */
contract BookRatings {

    // ==================== STRUCTS ====================

    /**
     * @dev Aggregated rating data for a single book
     */
    struct Book {
        uint256 bookId;
        uint256 totalReviews;
        uint256 avgGenre;       // Average genre accuracy score (1-10)
        uint256 avgPlot;        // Average plot development score (1-10)
        uint256 avgCharacter;   // Average character development score (1-10)
        uint256 avgWorld;       // Average world building score (1-10)
        uint256 avgOverall;     // Weighted overall average (1-10)
    }

    /**
     * @dev A single review submitted by a user for a book
     */
    struct Review {
        address userAddress;
        uint256 bookId;
        string  bookName;
        string  comment;
        uint256 genreScore;      // Genre accuracy (1-10)
        uint256 plotScore;       // Plot development (1-10)
        uint256 characterScore;  // Character development (1-10)
        uint256 worldScore;      // World building (1-10)
        uint256 overallScore;    // Calculated average of 4 dimensions (1-10)
        uint256 timestamp;
        int256  helpfulVotes;    // Net helpful votes (+1 helpful, -1 not helpful)
    }

    /**
     * @dev Reputation info tracked per reviewer address
     */
    struct ReviewerReputation {
        int256  reputationScore;   // Net score from all votes received
        uint256 totalReviews;      // Total number of reviews submitted
    }

    // ==================== STATE VARIABLES ====================

    mapping(uint256 => Book)   private books;
    Review[]                   private reviews;

    // Tracks reviewer reputation per address
    mapping(address => ReviewerReputation) private reviewerReputations;

    // Tracks whether a user has already voted on a specific review (by review index)
    // reviewVotes[reviewIndex][voterAddress] = true if voted
    mapping(uint256 => mapping(address => bool)) private reviewVotes;

    // ==================== EVENTS ====================

    event ReviewSubmitted(address indexed user, uint256 indexed bookId, string bookName, uint256 overallScore);
    event ReviewVoted(address indexed voter, uint256 indexed reviewIndex, bool helpful);

    // ==================== WRITE FUNCTIONS ====================

    /**
     * @notice Submit a multi-dimensional review for a book
     * @param _bookId       Unique identifier for the book (e.g., from Google Books API)
     * @param _bookName     Human-readable title of the book
     * @param _comment      Review text (min 50 characters enforced on front-end)
     * @param _genreScore   Genre accuracy rating (1-10)
     * @param _plotScore    Plot development rating (1-10)
     * @param _characterScore Character development rating (1-10)
     * @param _worldScore   World building rating (1-10)
     */
    function rateBook(
        uint256 _bookId,
        string  memory _bookName,
        string  memory _comment,
        uint256 _genreScore,
        uint256 _plotScore,
        uint256 _characterScore,
        uint256 _worldScore
    ) public {
        require(_bookId > 0, "Book ID is required");
        require(
            _genreScore >= 1 && _genreScore <= 10,
            "Genre score must be 1-10"
        );
        require(
            _plotScore >= 1 && _plotScore <= 10,
            "Plot score must be 1-10"
        );
        require(
            _characterScore >= 1 && _characterScore <= 10,
            "Character score must be 1-10"
        );
        require(
            _worldScore >= 1 && _worldScore <= 10,
            "World score must be 1-10"
        );
        require(
            !isBookRatedByUser(_bookId, msg.sender),
            "You have already reviewed this book"
        );

        uint256 _overallScore = (_genreScore + _plotScore + _characterScore + _worldScore) / 4;

        // Store the review
        reviews.push(Review({
            userAddress:    msg.sender,
            bookId:         _bookId,
            bookName:       _bookName,
            comment:        _comment,
            genreScore:     _genreScore,
            plotScore:      _plotScore,
            characterScore: _characterScore,
            worldScore:     _worldScore,
            overallScore:   _overallScore,
            timestamp:      block.timestamp,
            helpfulVotes:   0
        }));

        // Update aggregated book stats
        if (books[_bookId].totalReviews == 0) {
            books[_bookId] = Book({
                bookId:       _bookId,
                totalReviews: 1,
                avgGenre:     _genreScore,
                avgPlot:      _plotScore,
                avgCharacter: _characterScore,
                avgWorld:     _worldScore,
                avgOverall:   _overallScore
            });
        } else {
            uint256 n = books[_bookId].totalReviews;
            books[_bookId].avgGenre     = (books[_bookId].avgGenre     * n + _genreScore)     / (n + 1);
            books[_bookId].avgPlot      = (books[_bookId].avgPlot      * n + _plotScore)      / (n + 1);
            books[_bookId].avgCharacter = (books[_bookId].avgCharacter * n + _characterScore) / (n + 1);
            books[_bookId].avgWorld     = (books[_bookId].avgWorld     * n + _worldScore)     / (n + 1);
            books[_bookId].avgOverall   = (books[_bookId].avgOverall   * n + _overallScore)   / (n + 1);
            books[_bookId].totalReviews = n + 1;
        }

        // Update reviewer stats
        reviewerReputations[msg.sender].totalReviews += 1;

        emit ReviewSubmitted(msg.sender, _bookId, _bookName, _overallScore);
    }

    /**
     * @notice Vote on a review to indicate if it is helpful / accurate
     * @dev Adjusts the reviewer's reputation score. Each address can only vote once per review.
     * @param _reviewIndex  Index into the global reviews array
     * @param _helpful      true = helpful (+1 rep), false = not helpful (-1 rep)
     */
    function voteOnReview(uint256 _reviewIndex, bool _helpful) public {
        require(_reviewIndex < reviews.length, "Review does not exist");
        require(
            reviews[_reviewIndex].userAddress != msg.sender,
            "Cannot vote on your own review"
        );
        require(
            !reviewVotes[_reviewIndex][msg.sender],
            "You have already voted on this review"
        );

        reviewVotes[_reviewIndex][msg.sender] = true;

        if (_helpful) {
            reviews[_reviewIndex].helpfulVotes += 1;
            reviewerReputations[reviews[_reviewIndex].userAddress].reputationScore += 1;
        } else {
            reviews[_reviewIndex].helpfulVotes -= 1;
            reviewerReputations[reviews[_reviewIndex].userAddress].reputationScore -= 1;
        }

        emit ReviewVoted(msg.sender, _reviewIndex, _helpful);
    }

    // ==================== READ FUNCTIONS ====================

    /**
     * @notice Check whether a specific user has already reviewed a given book
     */
    function isBookRatedByUser(uint256 _bookId, address _userAddress) public view returns (bool) {
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].bookId == _bookId && reviews[i].userAddress == _userAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Check whether a user has already voted on a specific review
     */
    function hasVotedOnReview(uint256 _reviewIndex, address _voter) public view returns (bool) {
        return reviewVotes[_reviewIndex][_voter];
    }

    /**
     * @notice Get aggregated rating data for a book
     */
    function getBookRating(uint256 _bookId) public view returns (Book memory) {
        require(_bookId >= 1, "Book ID is required");
        return books[_bookId];
    }

    /**
     * @notice Get all reviews for a specific book
     */
    function getBookReviews(uint256 _bookId) public view returns (Review[] memory) {
        require(_bookId >= 1, "Book ID is required");

        uint256 count = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].bookId == _bookId) {
                count++;
            }
        }

        Review[] memory result = new Review[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].bookId == _bookId) {
                result[idx] = reviews[i];
                idx++;
            }
        }
        return result;
    }

    /**
     * @notice Get the reputation data for a given reviewer
     */
    function getReviewerReputation(address _reviewer) public view returns (ReviewerReputation memory) {
        return reviewerReputations[_reviewer];
    }

    /**
     * @notice Get the index of all reviews for a book (used for voting)
     */
    function getBookReviewIndices(uint256 _bookId) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].bookId == _bookId) count++;
        }
        uint256[] memory indices = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].bookId == _bookId) {
                indices[idx] = i;
                idx++;
            }
        }
        return indices;
    }

    /**
     * @notice Get the latest N reviews globally (across all books)
     * @param _limit Maximum number of reviews to return
     */
    function getLatestBookReviews(uint256 _limit) public view returns (Review[] memory) {
        uint256 total = reviews.length;
        uint256 count = _limit < total ? _limit : total;

        Review[] memory result = new Review[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = reviews[total - 1 - i]; // newest first
        }
        return result;
    }

    /**
     * @notice Get total review count (useful for pagination)
     */
    function getTotalReviews() public view returns (uint256) {
        return reviews.length;
    }

    /**
     * @notice Sanity-check function
     */
    function test() public pure returns (string memory) {
        return "Hello from BookRatings contract!";
    }
}
