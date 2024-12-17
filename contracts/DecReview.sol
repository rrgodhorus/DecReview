// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecReviewContract {

    struct Review {
        uint8 score;         // Score from 1 to 10
        string reviewText;   // Review text
        address reviewer;    // Address of the reviewer
    }

    mapping(address => Review[]) public reviews; // Maps each address (e.g., restaurant) to a list of reviews

    // Function to submit a review
    function submitReview(address entity, uint8 score, string memory reviewText) public {
        require(score >= 1 && score <= 10, "Score must be between 1 and 10");
        require(bytes(reviewText).length <= 140, "Review text must be 140 characters or less");
        
        // Create a new review and push it to the list for the entity
        reviews[entity].push(Review({
            score: score,
            reviewText: reviewText,
            reviewer: msg.sender
        }));
    }

    // Function to get reviews for a specific entity
    function getReviews(address entity) public view returns (Review[] memory) {
        return reviews[entity];
    }
}
