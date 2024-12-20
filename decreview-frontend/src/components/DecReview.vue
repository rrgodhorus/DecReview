<template>
  <div style="gap: 20px;">
    <div>
      <!-- <p v-if="walletAddress">Wallet Address: {{ walletAddress }}</p> -->
      <form @submit.prevent="checkENSName">
        <input style="width: calc(10ch + 7em);color: whitesmoke;" v-model="ensName" type="text" autocomplete="on"
          placeholder="Enter ENS name or address" />
        <button style="color: whitesmoke;">Check</button>
      </form>
    </div>
    <p v-if="loading">Checking...</p>
    <p v-if="exists !== null">
      {{ exists ? `ENS Name resolved to ${resolvedAddress}` : 'This ENS name does not exist.' }}
    </p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="">
      <img v-if="entity?.avatar" :src="entity?.avatar" style="width: 400px; height: 300px;border-radius: 50%;  ">
      <h3 v-if="entity?.name">{{ entity?.name }}</h3>
      <p v-if="entity?.description">{{ entity?.description }}</p>
    </div>
    <div v-if="resolvedAddress" class="reviews-container">
      <h1>Reviews</h1>

      <div v-if="reviews.length > 0">
        <div v-for="(review, index) in reviews" :key="index" class="review-card">
          <div class="review-image">
            <img v-if="review[3]" :src="review[3]" style="width: 150px; height: 150px; border-radius: 50%;">
            <img v-else src="/placeholder-avatar.jpeg" style="width: 150px; height: 150px; border-radius: 50%;">
          </div>
          <div class="review-details">
            <p><strong>Score:</strong> {{ review[0] }}</p>
            <p><strong>Comment:</strong> {{ review[1] }}</p>
            <p><strong>Reviewer:</strong> {{ review[2] }}</p>
          </div>
        </div>
      </div>
      <p v-else>No reviews available.</p>
    </div>
    <div v-if="resolvedAddress" class="review-container">
      <h1>Submit Your Review</h1>

      <form @submit.prevent="handleReviewSubmit" class="review-form">
        <div class="form-group">
          <label for="reviewScore">Score (1-10):</label>
          <input style="color: white;" id="reviewScore" type="number" v-model.number="reviewScore" min="1" max="10"
            required />
        </div>

        <div class="form-group">
          <label for="reviewText">Review (140 characters max):</label>
          <textarea style="color: white;" id="reviewText" v-model="reviewText" maxlength="140"
            placeholder="Enter your review here..." required></textarea>
        </div>

        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <span v-if="isSubmitting"> Waiting for block confirmation...</span>
          <span v-else>Submit Review</span>
        </button>
      </form>

      <div v-if="submitted" class="submitted-review">
        <h2>Review Submitted &#10004;</h2>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { getReviews, submitReview } from "../ethersHelper";


export default {
  props: {
    walletAddress: String,
  },
  data() {
    return {
      isRedirect: null,
      ensName: "",
      exists: null,
      loading: false,
      error: null,
      resolvedAddress: null,
      reviewScore: null, // Holds the numeric review score
      reviewText: "",    // Holds the review text
      isSubmitting: false,  // Used to show spinner
      submitted: false,  // Tracks if the form has been submitted
      reviews: [], // To hold the reviews
      entity: {} // Entity
    };
  },
  methods: {
    async checkENSName() {
      if (!this.ensName) {
        return;
      }
      this.loading = true;
      this.exists = null;
      this.error = null;

      if (!this.ensName.endsWith(".eth")) {
        try {
          this.exists = true;
          this.resolvedAddress = this.ensName
          const result = await getReviews(this.ensName);
          this.reviews = result;
        } catch (err) {
          this.error = "Could not find address.";
        } finally {
          this.loading = false;
        }
      }
      else {
        try {
          const provider = new ethers.BrowserProvider(ethereum);

          // Check if the ENS name is registered
          const resolvedName = await provider.resolveName(this.ensName);
          this.exists = resolvedName !== null;
          this.resolvedAddress = resolvedName ?? null;
          this.entity.avatar = await provider.getAvatar(this.ensName);
          const resolver = await provider.getResolver(this.ensName);
          this.entity.name = await resolver.getText("name");
          this.entity.description = await resolver.getText("description");
          let result = await getReviews(this.ensName);
          result = await Promise.all(result.map(async ([score, text, reviewer]) => {
            const reviewerEns = await provider.lookupAddress(reviewer) ?? reviewer;
            const reviewerAvatar = await provider.getAvatar(reviewerEns);
            return [score, text, reviewerEns, reviewerAvatar];
          }));
          this.reviews = result;
        } catch (err) {
          console.log(err)
          this.error = "Error resolving ENS name.";
        } finally {
          this.loading = false;
        }
      }
    },
    async handleReviewSubmit() {
      try {
        if (!this.walletAddress) {
          this.errorMessage = "Please connect your wallet first.";
          return;
        }
        this.isSubmitting = true
        // Call the contract function
        const transactionResponse = await submitReview(this.ensName, this.reviewScore, this.reviewText);
        const transactionReceipt = await transactionResponse.wait(1); // Wait for 1 block to confirm
        this.submitted = true;
        setTimeout(() => {
          this.submitted = false
        }, 2000);
        let result = await getReviews(this.ensName);
        result = await Promise.all(result.map(async ([score, text, reviewer]) => {
          const reviewerEns = await provider.lookupAddress(reviewer) ?? reviewer;
          const reviewerAvatar = await provider.getAvatar(reviewerEns);
          return [score, text, reviewerEns, reviewerAvatar];
        }));
        this.reviews = result;
        this.errorMessage = null;
      } catch (error) {
        console.error(error);
        this.errorMessage = "Error interacting with the contract.";
      } finally {
        this.isSubmitting = false
      }

      this.reviewScore = null;
      this.reviewText = "";
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const entityAddress = urlParams.get('entity');
    this.isRedirect = true;
    this.ensName = entityAddress;
    this.checkENSName();
  }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}

input {
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px;
  font-size: 16px;
  margin-left: 10px;
}

.error {
  color: red;
}
</style>

<style scoped>
/* Container Styling */
.review-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(249, 249, 249, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Title Styling */
h1 {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

/* Form Styling */
.review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Group Styling */
.form-group {
  display: flex;
  flex-direction: column;
}

/* Label Styling */
label {
  font-weight: bold;
  color: #222;
  margin-bottom: 5px;
}

/* Input and Textarea Styling */
input,
textarea {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  background-color: #444;
}

input:focus,
textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

/* Textarea Specific Styling */
textarea {
  resize: none;
  height: 100px;
}

/* Button Styling */
.submit-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #0056b3;
}

/* Submitted Review Section */
.submitted-review {
  margin-top: 20px;
  padding: 10px;
  background-color: #e9ffe9;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  color: black;
}

.submitted-review h2 {
  font-size: 18px;
  color: #155724;
}
</style>

<style scoped>
/* Container for reviews */
.reviews-container {
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(249, 249, 249, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Title Styling */
h1 {
  text-align: center;
  color: #111;
  margin-bottom: 20px;
}

/* Review Card Styling */
.review-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  /* Vertically aligns image and text */
}

.review-card p {
  margin: 5px 0;
  color: #555;
}

.review-card p strong {
  color: #000;
}

.review-image {
  margin-right: 20px;
}

.review-details {
  max-width: 600px;
  text-align: left;
}
</style>
